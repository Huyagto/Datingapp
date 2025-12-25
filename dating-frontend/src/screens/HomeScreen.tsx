import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { SUGGESTED_PROFILES } from "../graphql/profile"; // 🔥 ĐỔI QUERY
import { SWIPE_USER } from "../graphql/swipe";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 200;

/* ======================
   TYPES - CẬP NHẬT
====================== */
type Profile = {
  id: string;
  name: string;
  age: number;
  gender?: string | null;
  bio?: string | null;
  distance?: number;
  interests?: string[];
  commonInterestsCount?: number; // 🔥 THÊM
  matchPercentage?: number;      // 🔥 THÊM
};

export default function HomeScreen() {
  // 🔥 ĐỔI QUERY TỪ NEARBY_PROFILES → SUGGESTED_PROFILES
  const { data, loading, error, refetch } = useQuery<{
    suggestedProfiles: Profile[];
  }>(SUGGESTED_PROFILES, {
    fetchPolicy: "network-only",
    variables: { limit: 20 }, // Có thể điều chỉnh limit
  });

  const [swipeUser] = useMutation(SWIPE_USER);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array of animations for better performance
  const positions = useRef<Animated.ValueXY[]>([]);
  const rotateAnims = useRef<Animated.AnimatedInterpolation<string>[]>([]);
  const likeOpacities = useRef<Animated.AnimatedInterpolation<number>[]>([]);
  const nopeOpacities = useRef<Animated.AnimatedInterpolation<number>[]>([]);
  const scaleAnims = useRef<Animated.AnimatedInterpolation<number>[]>([]);

  // Initialize animations for each profile
  useEffect(() => {
    if (profiles.length > 0) {
      positions.current = profiles.map(() => new Animated.ValueXY());
      rotateAnims.current = profiles.map((_, index) =>
        positions.current[index].x.interpolate({
          inputRange: [-width / 2, 0, width / 2],
          outputRange: ["-10deg", "0deg", "10deg"],
          extrapolate: "clamp",
        })
      );
      likeOpacities.current = profiles.map((_, index) =>
        positions.current[index].x.interpolate({
          inputRange: [0, width / 4],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      );
      nopeOpacities.current = profiles.map((_, index) =>
        positions.current[index].x.interpolate({
          inputRange: [-width / 4, 0],
          outputRange: [1, 0],
          extrapolate: "clamp",
        })
      );
      scaleAnims.current = profiles.map((_, index) =>
        positions.current[index].x.interpolate({
          inputRange: [-width, 0, width],
          outputRange: [0.95, 1, 0.95],
          extrapolate: "clamp",
        })
      );
    }
  }, [profiles]);
  useEffect(() => {
    if (data?.suggestedProfiles) { 
      console.log("📱 Suggested profiles data:", data.suggestedProfiles);
      
      const profilesWithDistance = data.suggestedProfiles.map((profile) => ({
        ...profile,
        distance: Math.floor(Math.random() * 20) + 1,
        interests: profile.interests || [],
      }));
      
      console.log("📱 Processed suggested profiles:", profilesWithDistance);
      setProfiles(profilesWithDistance);
      setCurrentIndex(0);
    }
  }, [data]);

  const createPanResponder = (index: number) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (index === currentIndex) {
          positions.current[index].setValue({
            x: gesture.dx,
            y: gesture.dy * 0.2,
          });
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (index === currentIndex) {
          if (gesture.dx > SWIPE_THRESHOLD) {
            swipeRight(index);
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            swipeLeft(index);
          } else {
            resetPosition(index);
          }
        }
      },
    });

  const swipeRight = async (index: number) => {
    const toUser = profiles[index];
    if (!toUser) return;

    try {
      Animated.parallel([
        Animated.timing(positions.current[index], {
          toValue: { x: width + 100, y: 0 },
          duration: SWIPE_OUT_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(positions.current[index + 1] || new Animated.ValueXY(), {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
      ]).start(async () => {
        try {
          await swipeUser({
            variables: {
              input: { toUserId: toUser.id, type: "LIKE" },
            },
          });
          setCurrentIndex((prev) => prev + 1);
        } catch (error) {
          console.error("❌ Swipe error:", error);
          Alert.alert("Lỗi", "Không thể swipe. Vui lòng thử lại");
          resetPosition(index);
        }
      });
    } catch (error) {
      console.error("❌ Animation error:", error);
    }
  };

  const swipeLeft = async (index: number) => {
    const toUser = profiles[index];
    if (!toUser) return;

    try {
      Animated.parallel([
        Animated.timing(positions.current[index], {
          toValue: { x: -width - 100, y: 0 },
          duration: SWIPE_OUT_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(positions.current[index + 1] || new Animated.ValueXY(), {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
      ]).start(async () => {
        try {
          await swipeUser({
            variables: {
              input: { toUserId: toUser.id, type: "PASS" },
            },
          });
          setCurrentIndex((prev) => prev + 1);
        } catch (error) {
          console.error("❌ Swipe error:", error);
          Alert.alert("Lỗi", "Không thể swipe. Vui lòng thử lại");
          resetPosition(index);
        }
      });
    } catch (error) {
      console.error("❌ Animation error:", error);
    }
  };

  const resetPosition = (index: number) => {
    Animated.spring(positions.current[index], {
      toValue: { x: 0, y: 0 },
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  /* ======================
     RENDER CARD - THÊM HIỂN THỊ MATCH INFO
====================== */
  const renderCard = (profile: Profile, index: number) => {
    if (index < currentIndex) return null;

    const isTopCard = index === currentIndex;
    const isSecondCard = index === currentIndex + 1;
    const panResponder = createPanResponder(index);
    const cardStyle = [
      styles.card,
      {
        zIndex: profiles.length - index,
        opacity: index > currentIndex + 2 ? 0 : 1,
      },
    ];

    return (
      <Animated.View
        key={profile.id}
        style={[
          cardStyle,
          {
            transform: [
              { translateX: positions.current[index]?.x || 0 },
              { translateY: positions.current[index]?.y || 0 },
              { rotate: rotateAnims.current[index] || "0deg" },
              { scale: isSecondCard ? 0.95 : 1 },
            ],
          },
        ]}
        {...(isTopCard ? panResponder.panHandlers : {})}
      >
        {/* Background Image/Color */}
        <LinearGradient
          colors={["#FF6B95", "#FF8E53", "#FF6B95"]}
          style={styles.gradientBackground}
        >
          <View style={styles.overlay} />
        </LinearGradient>

        {/* Header Info */}
        <View style={styles.headerInfo}>
          {/* 🔥 HIỂN THỊ MATCH PERCENTAGE */}
          {profile.matchPercentage && profile.matchPercentage > 0 && (
            <View style={styles.matchBadge}>
              <Ionicons name="heart" size={14} color="#FFF" />
              <Text style={styles.matchText}>
                {profile.matchPercentage}% phù hợp
              </Text>
            </View>
          )}
          
          <View style={styles.location}>
            <Ionicons name="location" size={16} color="#FFF" />
            <Text style={styles.locationText}>{profile.distance} km</Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {profile.name}, {profile.age}
            </Text>
            {profile.gender && (
              <View style={styles.genderBadge}>
                <Ionicons
                  name={profile.gender === "FEMALE" ? "female" : "male"}
                  size={16}
                  color="#FFF"
                />
                <Text style={styles.genderText}>
                  {profile.gender === "MALE"
                    ? "Nam"
                    : profile.gender === "FEMALE"
                    ? "Nữ"
                    : profile.gender}
                </Text>
              </View>
            )}
          </View>

          {profile.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {profile.bio}
            </Text>
          )}

          {/* Interests với hiển thị số interests chung */}
          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.interestsSection}>
              <View style={styles.interestsHeader}>
                <Text style={styles.interestsTitle}>
                  Sở thích {profile.commonInterestsCount ? 
                    `(${profile.commonInterestsCount} chung với bạn)` : ''}
                </Text>
              </View>
              <View style={styles.interestsContainer}>
                {profile.interests.slice(0, 5).map((interest, idx) => (
                  <View key={idx} style={styles.interestChip}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
                {profile.interests.length > 5 && (
                  <View style={[styles.interestChip, styles.moreInterestChip]}>
                    <Text style={styles.interestText}>
                      +{profile.interests.length - 5}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Swipe Indicators */}
        {isTopCard && (
          <>
            <Animated.View
              style={[
                styles.likeBadge,
                {
                  opacity: likeOpacities.current[index] || 0,
                  transform: [{ rotate: "-20deg" }],
                },
              ]}
            >
              <LinearGradient
                colors={["#00C853", "#64DD17"]}
                style={styles.likeGradient}
              >
                <Ionicons name="heart" size={28} color="#FFF" />
                <Text style={styles.likeText}>LIKE</Text>
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={[
                styles.nopeBadge,
                {
                  opacity: nopeOpacities.current[index] || 0,
                  transform: [{ rotate: "20deg" }],
                },
              ]}
            >
              <LinearGradient
                colors={["#FF4081", "#F50057"]}
                style={styles.nopeGradient}
              >
                <Ionicons name="close" size={28} color="#FFF" />
                <Text style={styles.nopeText}>NOPE</Text>
              </LinearGradient>
            </Animated.View>
          </>
        )}
      </Animated.View>
    );
  };

  /* ======================
     LOADING & EMPTY STATES
====================== */
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <LinearGradient
          colors={["#667EEA", "#764BA2"]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Đang tìm người phù hợp...</Text>
        <Text style={styles.loadingSubtext}>
          Dựa trên sở thích của bạn
        </Text>
      </View>
    );
  }

  if (error) {
    console.error("❌ GraphQL Error:", error);
    return (
      <View style={styles.centerContainer}>
        <LinearGradient
          colors={["#667EEA", "#764BA2"]}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="alert-circle-outline" size={80} color="#FFF" />
        <Text style={styles.emptyText}>Lỗi tải dữ liệu</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => refetch()}
        >
          <LinearGradient
            colors={["#FF6B95", "#FF8E53"]}
            style={styles.refreshGradient}
          >
            <Ionicons name="refresh" size={24} color="#FFF" />
            <Text style={styles.refreshText}>Thử lại</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <LinearGradient
          colors={["#667EEA", "#764BA2"]}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="people-outline" size={80} color="#FFF" />
        <Text style={styles.emptyText}>Chưa tìm thấy người phù hợp</Text>
        <Text style={styles.hintText}>
          Hãy cập nhật sở thích của bạn để tìm match tốt hơn
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => refetch()}
        >
          <LinearGradient
            colors={["#FF6B95", "#FF8E53"]}
            style={styles.refreshGradient}
          >
            <Ionicons name="refresh" size={24} color="#FFF" />
            <Text style={styles.refreshText}>Tải lại</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.centerContainer}>
        <LinearGradient
          colors={["#667EEA", "#764BA2"]}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="checkmark-circle-outline" size={80} color="#FFF" />
        <Text style={styles.emptyText}>Bạn đã xem hết rồi! 🎉</Text>
        <Text style={styles.hintText}>
          Đã swipe {profiles.length} hồ sơ phù hợp
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => refetch()}
        >
          <LinearGradient
            colors={["#FF6B95", "#FF8E53"]}
            style={styles.refreshGradient}
          >
            <Ionicons name="refresh" size={24} color="#FFF" />
            <Text style={styles.refreshText}>Xem thêm</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* Header */}
      <LinearGradient
        colors={["rgba(15,15,30,0.9)", "rgba(15,15,30,0)"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phù hợp với bạn</Text>
          <TouchableOpacity>
            <Ionicons name="filter" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Cards */}
      <View style={styles.cardContainer}>
        {profiles.map(renderCard)}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => swipeLeft(currentIndex)}
        >
          <LinearGradient
            colors={["#FF4081", "#F50057"]}
            style={styles.buttonGradient}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => swipeRight(currentIndex)}
        >
          <LinearGradient
            colors={["#00C853", "#64DD17"]}
            style={styles.buttonGradient}
          >
            <Ionicons name="heart" size={32} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ======================
   STYLES - THÊM STYLES MỚI
====================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  emptyText: {
    marginTop: 20,
    fontSize: 20,
    color: "#FFF",
    fontWeight: "600",
  },
  hintText: {
    marginTop: 10,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 20,
  },

  // Header
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },

  // Card Container
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },

  // Card
  card: {
    position: "absolute",
    width: width * 0.9,
    height: height * 0.72,
    borderRadius: 24,
    backgroundColor: "#FFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  // Header Info với match badge
  headerInfo: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,107,149,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  matchText: {
    marginLeft: 4,
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: {
    marginLeft: 4,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Profile Info
  profileInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginRight: 12,
  },
  genderBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  genderText: {
    marginLeft: 4,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  bio: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
    marginBottom: 16,
  },

  // Interests section mới
  interestsSection: {
    marginTop: 12,
  },
  interestsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  interestsTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  interestChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  moreInterestChip: {
    backgroundColor: "rgba(255,107,149,0.3)",
  },
  interestText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "500",
  },

  // Swipe Indicators
  likeBadge: {
    position: "absolute",
    top: 40,
    left: 30,
    borderRadius: 12,
    overflow: "hidden",
  },
  likeGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  likeText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  nopeBadge: {
    position: "absolute",
    top: 40,
    right: 30,
    borderRadius: 12,
    overflow: "hidden",
  },
  nopeGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  nopeText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  // Refresh Button
  refreshButton: {
    marginTop: 30,
    borderRadius: 25,
    overflow: "hidden",
  },
  refreshGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  refreshText: {
    marginLeft: 10,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});