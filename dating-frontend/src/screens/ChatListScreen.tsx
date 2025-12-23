import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useQuery } from "@apollo/client/react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { MY_MATCHES } from "../graphql/match";

type User = {
  id: string;
  name: string;
  avatar?: string;
};

type Match = {
  id: string;
  userA: User;
  userB: User;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount?: number;
};

// 🔥 FIX: Hàm tạo màu với kiểm tra seed
const getRandomColor = (seed?: string) => {
  const colors = [
    "#FF4081", "#2196F3", "#4CAF50", 
    "#FF9800", "#9C27B0", "#00BCD4",
    "#795548", "#607D8B"
  ];
  
  // Nếu seed undefined hoặc rỗng, dùng màu mặc định
  if (!seed || seed.trim() === "") {
    return "#FF4081"; // Màu chủ đạo của app
  }
  
  try {
    const hash = seed.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  } catch (error) {
    return "#FF4081";
  }
};

export default function ChatListScreen({ navigation }: any) {
  const { data, loading, refetch } = useQuery<{
    myMatches: Match[];
  }>(MY_MATCHES);
  
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  // 🔥 FIX: Xử lý partner an toàn
  const getPartnerInfo = (match: Match) => {
    // Kiểm tra userB tồn tại và có thuộc tính cần thiết
    const partner = match.userB || { 
      id: match.id || "unknown", 
      name: "Người dùng", 
      avatar: undefined 
    };
    
    const partnerName = partner.name || "Người dùng";
    
    return {
      id: partner.id || match.id,
      name: partnerName,
      avatar: partner.avatar,
      initial: partnerName.charAt(0).toUpperCase(),
    };
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) {
        return "Vừa xong";
      } else if (diffMins < 60) {
        return `${diffMins} phút`;
      } else if (diffHours < 24) {
        return `${diffHours} giờ`;
      } else if (diffDays < 7) {
        return `${diffDays} ngày`;
      } else {
        return date.toLocaleDateString('vi-VN', { 
          day: 'numeric',
          month: 'numeric'
        });
      }
    } catch (error) {
      return "";
    }
  };

  // Component Chat Item - 🔥 FIX: Xử lý undefined
  const ChatItem = ({ item }: { item: Match }) => {
    if (!item) return null;
    
    const partner = getPartnerInfo(item);
    const lastMessage = item.lastMessage?.content || "Bắt đầu trò chuyện...";
    const timeAgo = formatTime(item.lastMessage?.createdAt);
    const unreadCount = item.unreadCount || 0;
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate("Chat", {
            matchId: item.id || "unknown",
            partnerName: partner.name,
          })
        }
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {partner.avatar ? (
            <Image
              source={{ uri: partner.avatar }}
              style={styles.avatar}
              onError={() => console.log("Lỗi tải avatar")}
            />
          ) : (
            <View style={[
              styles.avatarPlaceholder, 
              { backgroundColor: getRandomColor(partner.id) }
            ]}>
              <Text style={styles.avatarText}>
                {partner.initial}
              </Text>
            </View>
          )}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Chat info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {partner.name}
            </Text>
            {timeAgo && (
              <Text style={styles.timeText}>
                {timeAgo}
              </Text>
            )}
          </View>
          
          <View style={styles.chatPreview}>
            <Text 
              style={[
                styles.messagePreview,
                unreadCount > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {lastMessage}
            </Text>
            
            {unreadCount > 0 && (
              <View style={styles.unreadIndicator} />
            )}
          </View>
        </View>

        {/* Chevron */}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <ActivityIndicator size="large" color="#FF4081" />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  const matches = data?.myMatches || [];
  const totalUnread = matches.reduce((acc, match) => {
    return acc + (match?.unreadCount || 0);
  }, 0);

  if (!matches || matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <View style={styles.emptyIllustration}>
          <Text style={{ fontSize: 80, color: "#E0E0E0" }}>💬</Text>
        </View>
        <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
        <Text style={styles.emptySubtitle}>
          Khi bạn có match mới, cuộc trò chuyện sẽ xuất hiện ở đây
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate("Explore")}
          activeOpacity={0.8}
        >
          <Text style={styles.exploreButtonText}>Khám phá người mới</Text>
          <Text style={styles.exploreButtonIcon}>→</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{matches.length}</Text>
            <Text style={styles.statLabel}>Cuộc trò chuyện</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalUnread}</Text>
            <Text style={styles.statLabel}>Tin chưa đọc</Text>
          </View>
        </View>
      </View>

      {/* Chat list */}
      <FlatList
        data={matches}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        renderItem={({ item }) => <ChatItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF4081"]}
            tintColor="#FF4081"
          />
        }
        ListEmptyComponent={
          <View style={styles.listEmpty}>
            <Text>Không có dữ liệu</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 40,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
  },
  emptyIllustration: {
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: "#FF4081",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  exploreButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  exploreButtonIcon: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "#FFF",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 15,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF4081",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  listContent: {
    paddingBottom: 20,
  },
  listEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF4081",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  unreadCount: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  chatPreview: {
    flexDirection: "row",
    alignItems: "center",
  },
  messagePreview: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: "#000",
    fontWeight: "500",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4081",
  },
  chevron: {
    fontSize: 24,
    color: "#BDBDBD",
    fontWeight: "bold",
  },
});