import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation } from "@apollo/client/react";
import { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";

import { NEARBY_PROFILES } from "../graphql/profile";
import { SWIPE_USER } from "../graphql/swipe";
import { SwipeUserResponse, SwipeUserVariables } from "../graphql/types/swipe";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 250;

type Profile = {
  id: string;
  name: string;
  age: number;
  gender?: string | null;
  bio?: string | null;
  avatar?: string | null;
  interests?: string[];
  job?: string;
  height?: number;
};

export default function HomeScreen() {
  const { data, loading, error, refetch } = useQuery<{
    nearbyProfiles: Profile[];
  }>(NEARBY_PROFILES, {
    fetchPolicy: "network-only",
  });

  const [swipeUser] = useMutation<SwipeUserResponse, SwipeUserVariables>(
    SWIPE_USER
  );

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-15deg", "0deg", "15deg"],
    extrapolate: "clamp",
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
  });
  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
  });

  useEffect(() => {
    if (data?.nearbyProfiles) {
      setProfiles(data.nearbyProfiles);
      setCurrentIndex(0);
      setNoMoreProfiles(data.nearbyProfiles.length === 0);
    }
  }, [data]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        // Swipe right - LIKE
        forceSwipe("right");
        handleSwipe(profiles[currentIndex]?.id, "LIKE");
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        // Swipe left - PASS
        forceSwipe("left");
        handleSwipe(profiles[currentIndex]?.id, "PASS");
      } else {
        // Reset position
        resetPosition();
      }
    },
  });

  const forceSwipe = (direction: "right" | "left") => {
    const x = direction === "right" ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => onSwipeComplete());
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  const onSwipeComplete = () => {
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipe = async (toUserId: string, type: "LIKE" | "PASS") => {
    try {
      const res = await swipeUser({
        variables: {
          input: { toUserId, type },
        },
      });

      if (type === "LIKE" && res.data?.swipeUser?.isMatch) {
        Alert.alert(
          "🎉 It's a Match!",
          "Hai bạn đã thích nhau! Vào tab Chat để trò chuyện 💬",
          [{ text: "Tuyệt vời!", style: "default" }]
        );
      }

      // Check if no more profiles
      if (currentIndex + 1 >= profiles.length) {
        setNoMoreProfiles(true);
      }
    } catch (e) {
      console.log("❌ SWIPE ERROR", e);
      // If error, refetch profiles
      refetch();
    }
  };

  const handleLike = () => {
    if (!profiles[currentIndex]) return;
    forceSwipe("right");
    handleSwipe(profiles[currentIndex].id, "LIKE");
  };

  const handlePass = () => {
    if (!profiles[currentIndex]) return;
    forceSwipe("left");
    handleSwipe(profiles[currentIndex].id, "PASS");
  };

  const renderCard = (profile: Profile, index: number) => {
    const isTopCard = index === currentIndex;
    const cardStyle = isTopCard
      ? [
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate: rotate },
            ],
          },
        ]
      : styles.card;

    if (index < currentIndex) return null;

    return (
      <Animated.View
        key={profile.id}
        style={cardStyle}
        {...(isTopCard ? panResponder.panHandlers : {})}
      >
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
            </View>
          )}
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          />
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.name}, {profile.age}
            </Text>
            {profile.gender && (
              <View style={styles.genderBadge}>
                <Text style={styles.genderText}>{profile.gender}</Text>
              </View>
            )}
          </View>

          {profile.job && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>💼</Text>
              <Text style={styles.detailText}>{profile.job}</Text>
            </View>
          )}

          {profile.height && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📏</Text>
              <Text style={styles.detailText}>{profile.height}cm</Text>
            </View>
          )}

          {profile.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText} numberOfLines={3}>
                {profile.bio}
              </Text>
            </View>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {profile.interests.slice(0, 3).map((interest, idx) => (
                <View key={idx} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Like/Nope Overlays */}
        {isTopCard && (
          <>
            <Animated.View style={[styles.likeContainer, { opacity: likeOpacity }]}>
              <View style={styles.likeBadge}>
                <Text style={styles.likeText}>LIKE</Text>
              </View>
            </Animated.View>
            <Animated.View style={[styles.nopeContainer, { opacity: nopeOpacity }]}>
              <View style={styles.nopeBadge}>
                <Text style={styles.nopeText}>NOPE</Text>
              </View>
            </Animated.View>
          </>
        )}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <ActivityIndicator size="large" color="#FF4081" />
        <Text style={styles.loadingText}>Đang tìm kiếm người phù hợp...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <Text style={styles.errorIcon}>😔</Text>
        <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
        <Text style={styles.errorMessage}>
          Vui lòng kiểm tra kết nối mạng và thử lại
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (noMoreProfiles || profiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <View style={styles.emptyIllustration}>
          <Text style={{ fontSize: 100 }}>👀</Text>
        </View>
        <Text style={styles.emptyTitle}>Hết người rồi!</Text>
        <Text style={styles.emptySubtitle}>
          Bạn đã xem hết tất cả hồ sơ gần đây.
          {"\n"}
          Hãy thử lại sau nhé!
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()}>
          <Text style={styles.refreshButtonText}>Tải lại</Text>
          <Text style={styles.refreshButtonIcon}>🔄</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HeartLink</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {profiles.map((profile, index) => renderCard(profile, index))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <View style={[styles.actionCircle, styles.passCircle]}>
            <Text style={styles.passIcon}>✕</Text>
          </View>
          <Text style={styles.actionLabel}>Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.superLikeButton}>
          <View style={[styles.actionCircle, styles.superLikeCircle]}>
            <Text style={styles.superLikeIcon}>⭐</Text>
          </View>
          <Text style={styles.actionLabel}>Super Like</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <View style={[styles.actionCircle, styles.likeCircle]}>
            <Text style={styles.likeIcon}>❤️</Text>
          </View>
          <Text style={styles.actionLabel}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FF4081",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#FF4081",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: "#FF4081",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  refreshButtonIcon: {
    color: "#FFF",
    fontSize: 18,
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    letterSpacing: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    fontSize: 20,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: "70%",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    backgroundColor: "#FF4081",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 60,
    color: "#FFF",
    fontWeight: "bold",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  infoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginRight: 10,
  },
  genderBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genderText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "500",
  },
  bioContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  bioText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestChip: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "500",
  },
  likeContainer: {
    position: "absolute",
    top: 50,
    left: 40,
    transform: [{ rotate: "-30deg" }],
  },
  likeBadge: {
    borderWidth: 4,
    borderColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  likeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  nopeContainer: {
    position: "absolute",
    top: 50,
    right: 40,
    transform: [{ rotate: "30deg" }],
  },
  nopeBadge: {
    borderWidth: 4,
    borderColor: "#FF4081",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255, 64, 129, 0.2)",
  },
  nopeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF4081",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  actionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  passCircle: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  likeCircle: {
    backgroundColor: "#FFF",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  superLikeCircle: {
    backgroundColor: "#FFF",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  passIcon: {
    fontSize: 28,
    color: "#FF4081",
    fontWeight: "bold",
  },
  likeIcon: {
    fontSize: 28,
  },
  superLikeIcon: {
    fontSize: 28,
    color: "#2196F3",
  },
  actionLabel: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
  },
  passButton: {
    alignItems: "center",
  },
  likeButton: {
    alignItems: "center",
  },
  superLikeButton: {
    alignItems: "center",
  },
});