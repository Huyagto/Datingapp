import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  AppState,
} from "react-native";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useSubscription,
} from "@apollo/client/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ======================
   GRAPHQL
====================== */
import {
  MESSAGES,
  SEND_MESSAGE,
  ON_MESSAGE,
} from "../graphql/chat";

/* ======================
   TYPES
====================== */
import {
  Message,
  MessagesResponse,
  MessagesVariables,
  SendMessageResponse,
  SendMessageVariables,
  OnMessageResponse,
  OnMessageVariables,
} from "../graphql/types/chat";

/* ======================
   SCREEN
====================== */
export default function ChatScreen(props: any) {
  const { route, navigation } = props;
  
  const params = route?.params || {};
  const matchId = params.matchId;
  const partnerName = params.partnerName || "Người dùng";
  const partnerAvatar = params.partnerAvatar;
  
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showDateHeaders, setShowDateHeaders] = useState<Record<string, boolean>>({});
  const [lastRefetchTime, setLastRefetchTime] = useState<number>(Date.now());

  const listRef = useRef<FlatList<Message>>(null);
  const inputRef = useRef<TextInput>(null);

  /* ======================
     GUARD
  ====================== */
  if (!matchId) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <Text style={styles.errorIcon}>💬</Text>
        <Text style={styles.errorTitle}>Không tìm thấy phòng chat</Text>
        <Text style={styles.errorMessage}>
          Vui lòng quay lại và thử lại
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        const decoded: any = jwtDecode(token);
        setMyId(decoded.sub);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    };
    getUserId();
  }, []);
  const { data, loading, error, refetch } = useQuery<
    MessagesResponse,
    MessagesVariables
  >(MESSAGES, {
    variables: { matchId },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    pollInterval: 30000, 
  });

  useEffect(() => {
    if (data?.messages) {
      console.log("📨 Setting messages:", data.messages.length);
      

      const sortedMessages = [...data.messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      setMessages(sortedMessages);
      
      
      const headers: Record<string, boolean> = {};
      sortedMessages.forEach((msg: Message) => {
        const date = formatDateHeader(msg.createdAt);
        headers[date] = true;
      });
      setShowDateHeaders(headers);
      
      // Auto scroll to bottom
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollToEnd({ animated: false });
        }
      }, 100);
    }
  }, [data]);

  /* ======================
     REALTIME SUBSCRIPTION - FIXED
  ====================== */
  const { data: subscriptionData } = useSubscription<
    OnMessageResponse,
    OnMessageVariables
  >(ON_MESSAGE, {
    variables: { matchId },
  });

  // Xử lý subscription data khi có
  useEffect(() => {
    if (subscriptionData?.onMessage) {
      const newMsg = subscriptionData.onMessage;
      console.log("📩 New realtime message received via subscription:", newMsg);

      setMessages((prev) => {
        // Avoid duplicates - kiểm tra kỹ hơn
        const isDuplicate = prev.some((m: Message) => m.id === newMsg.id);
        
        if (isDuplicate) {
          console.log("🔄 Duplicate message detected, skipping");
          return prev;
        }
        
        console.log("✅ Adding new subscription message to state");
        const date = formatDateHeader(newMsg.createdAt);
        if (!showDateHeaders[date]) {
          setShowDateHeaders((prevHeaders: Record<string, boolean>) => ({ 
            ...prevHeaders, 
            [date]: true 
          }));
        }
        const updatedMessages = [...prev, newMsg].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        return updatedMessages;
      });
    }
  }, [subscriptionData, showDateHeaders]);

  // Debug subscription connection
  useEffect(() => {
    console.log("🎯 Subscription status for matchId:", matchId);
    console.log("📡 Subscription data available:", !!subscriptionData);
  }, [subscriptionData, matchId]);

  /* ======================
     HANDLE APP STATE CHANGES - Auto refetch khi app active
  ====================== */
  useEffect(() => {
    // Refetch khi quay lại màn hình chat
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("🔄 Chat screen focused, auto refetching messages");
      refetch();
    });

    // Refetch khi app từ background trở lại
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log("🔄 App became active, auto refetching messages");
        refetch();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, [navigation, refetch]);

  /* ======================
     AUTO REFRESH MESSAGES - Tự động load tin nhắn mới
  ====================== */
  useEffect(() => {
    // Kiểm tra tin nhắn mới mỗi 15 giây
    const autoRefreshInterval = setInterval(() => {
      if (!loading) {
        console.log("🔄 Auto-refreshing messages");
        refetch();
      }
    }, 15000); // 15 giây

    return () => clearInterval(autoRefreshInterval);
  }, [loading, refetch]);

  /* ======================
     UTILS
  ====================== */
  const formatTime = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (e) {
      return "";
    }
  };

  const formatDateHeader = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return "Hôm nay";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Hôm qua";
      } else {
        return date.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });
      }
    } catch (e) {
      return "";
    }
  };

  const formatMessageDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        return formatTime(dateString);
      } else if (diffDays < 7) {
        return date.toLocaleDateString('vi-VN', { weekday: 'short' }) + ' ' + formatTime(dateString);
      } else {
        return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' }) + ' ' + formatTime(dateString);
      }
    } catch (e) {
      return "";
    }
  };

  const shouldShowDateHeader = useCallback((index: number): boolean => {
    if (index === 0) return true;
    
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    
    if (!currentMsg?.createdAt || !prevMsg?.createdAt) return false;
    
    try {
      const currentDate = new Date(currentMsg.createdAt).toDateString();
      const prevDate = new Date(prevMsg.createdAt).toDateString();
      return currentDate !== prevDate;
    } catch (e) {
      return false;
    }
  }, [messages]);

  const renderDateHeader = useCallback((dateString: string) => {
    if (!dateString) return null;
    const date = formatDateHeader(dateString);
    if (!date) return null;
    
    return (
      <View style={styles.dateHeaderContainer}>
        <View style={styles.dateHeaderLine} />
        <Text style={styles.dateHeaderText}>{date}</Text>
        <View style={styles.dateHeaderLine} />
      </View>
    );
  }, []);

  /* ======================
     SEND MESSAGE - FIXED
  ====================== */
  const [sendMessage] = useMutation<
    SendMessageResponse,
    SendMessageVariables
  >(SEND_MESSAGE, {
    onCompleted: (data) => {
      console.log("✅ Mutation completed:", data?.sendMessage);
      
      // Thêm tin nhắn từ mutation result vào state nếu subscription không hoạt động
      const sentMessage = data?.sendMessage;
      if (sentMessage) {
        console.log("🔄 Adding message from mutation result to state");
        
        setMessages((prev) => {
          // Kiểm tra xem tin nhắn đã có chưa
          const alreadyExists = prev.some(m => m.id === sentMessage.id);
          if (alreadyExists) {
            console.log("🔄 Message already exists in state");
            return prev;
          }
          
          // Thêm tin nhắn mới và sắp xếp lại
          const updatedMessages = [...prev, sentMessage].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          return updatedMessages;
        });
      }
    },
  });

  const handleSend = async () => {
    if (!text.trim() || !myId || isSending) return;

    setIsSending(true);
    
    // Optimistic message
    const tempId = "tmp-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    const optimisticMsg: Message = {
      id: tempId,
      senderId: myId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    console.log("📤 Sending optimistic message:", optimisticMsg);
    
    setMessages((prev) => [...prev, optimisticMsg]);
    const currentText = text;
    setText("");

    try {
      const result = await sendMessage({
        variables: {
          matchId,
          text: currentText.trim(),
        },
      });
      
      console.log("✅ Message sent successfully:", result.data?.sendMessage);
      
      // Tự động refetch sau khi gửi tin nhắn thành công
      setTimeout(() => {
        console.log("🔄 Auto refetching after sending message");
        refetch();
      }, 1000);
      
      // Tự động thay thế tin nhắn tạm sau 2 giây nếu subscription không hoạt động
      setTimeout(() => {
        setMessages((prev) => {
          // Kiểm tra xem tin nhắn thật đã được thêm chưa
          const realMessageExists = prev.some(m => m.id === result.data?.sendMessage?.id);
          const tempMessageExists = prev.some(m => m.id === tempId);
          
          if (!realMessageExists && tempMessageExists) {
            console.log("🕒 Timeout - replacing temporary message with real one");
            const filtered = prev.filter(msg => msg.id !== tempId);
            if (result.data?.sendMessage) {
              return [...filtered, result.data.sendMessage].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
            }
          }
          return prev;
        });
      }, 2000);
      
    } catch (e: any) {
      console.log("❌ SEND MESSAGE ERROR", e);
      Alert.alert("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
      // Remove optimistic message on error
      setMessages((prev: Message[]) => {
        const filtered = prev.filter(msg => msg.id !== tempId);
        console.log("❌ Error - removed optimistic message");
        return filtered;
      });
      setText(currentText);
    } finally {
      setIsSending(false);
    }
  };

  /* ======================
     RENDER MESSAGE FUNCTION
  ====================== */
  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === myId;
    const showHeader = shouldShowDateHeader(index);
    const isTemporary = item.id.includes('tmp-');
    
    // Kiểm tra xem có nên hiển thị thời gian
    let showTime = false;
    if (index === messages.length - 1) {
      showTime = true;
    } else if (messages[index + 1]) {
      const nextMsg = messages[index + 1];
      if (nextMsg.senderId !== item.senderId) {
        showTime = true;
      } else if (item.createdAt && nextMsg.createdAt) {
        try {
          const currentTime = new Date(item.createdAt).getTime();
          const nextTime = new Date(nextMsg.createdAt).getTime();
          if (nextTime - currentTime > 300000) { // 5 minutes
            showTime = true;
          }
        } catch (e) {
          showTime = true;
        }
      }
    }

    return (
      <>
        {showHeader && renderDateHeader(item.createdAt)}
        <View
          style={[
            styles.messageContainer,
            isMe ? styles.myMessageContainer : styles.theirMessageContainer,
          ]}
        >
          {!isMe && partnerAvatar ? (
            <Image source={{ uri: partnerAvatar }} style={styles.avatar} />
          ) : !isMe && (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{partnerName.charAt(0)}</Text>
            </View>
          )}
          
          <View style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.theirMessageBubble,
            isTemporary && styles.temporaryMessageBubble,
          ]}>
            <Text style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.theirMessageText,
              isTemporary && styles.temporaryMessageText,
            ]}>
              {item.text}
            </Text>
            
            {showTime && item.createdAt && (
              <Text style={[
                styles.messageTime,
                isMe ? styles.myMessageTime : styles.theirMessageTime,
                isTemporary && styles.temporaryMessageTime,
              ]}>
                {formatMessageDate(item.createdAt)}
                {isTemporary && ' (Đang gửi...)'}
              </Text>
            )}
          </View>
        </View>
      </>
    );
  }, [myId, messages, partnerAvatar, partnerName, shouldShowDateHeader, renderDateHeader]);

  /* ======================
     RENDER
  ====================== */
  if (loading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <ActivityIndicator size="large" color="#FF4081" />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  if (error) {
    console.error("❌ GraphQL Error:", error);
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <Text style={styles.errorIcon}>😔</Text>
        <Text style={styles.errorTitle}>Không thể tải tin nhắn</Text>
        <Text style={styles.errorMessage}>
          {error.message}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header - Đã bỏ nút refresh */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerInfo}>
          {partnerAvatar ? (
            <Image source={{ uri: partnerAvatar }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
              <Text style={styles.headerAvatarText}>{partnerName.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {partnerName}
            </Text>
            <Text style={styles.onlineStatus}>
              {subscriptionData ? "🟢 Đang hoạt động" : "⚪️ Đang kết nối..."}
            </Text>
          </View>
        </View>
        
        {/* Đã bỏ nút refresh */}
        <View style={{ width: 40 }} />
      </View>

      {/* Messages List - Đã bỏ pull-to-refresh */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item: Message) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 20 },
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          setTimeout(() => {
            if (listRef.current) {
              listRef.current.scrollToEnd({ animated: true });
            }
          }, 100);
        }}
        onLayout={() => {
          setTimeout(() => {
            if (listRef.current) {
              listRef.current.scrollToEnd({ animated: false });
            }
          }, 100);
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Bắt đầu cuộc trò chuyện</Text>
            <Text style={styles.emptyMessage}>
              Hãy gửi lời chào đến {partnerName}!
            </Text>
            <TouchableOpacity
              style={styles.sendHelloButton}
              onPress={() => {
                setText("Xin chào!");
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
            >
              <Text style={styles.sendHelloButtonText}>Gửi lời chào</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            style={styles.textInput}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!text.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!text.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.sendButtonIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.charCounter}>
          {text.length}/500
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
    fontSize: 22,
    fontWeight: "600",
    color: "#FF4081",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 30,
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
  debugContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 5,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingHorizontal: 15,
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonIcon: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    backgroundColor: "#FF4081",
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  onlineStatus: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    color: "#E0E0E0",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  sendHelloButton: {
    backgroundColor: "#FF4081",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendHelloButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  dateHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dateHeaderText: {
    fontSize: 12,
    color: "#999",
    marginHorizontal: 10,
    fontWeight: "500",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 8,
    maxWidth: "85%",
  },
  myMessageContainer: {
    alignSelf: "flex-end",
    marginLeft: "auto",
  },
  theirMessageContainer: {
    alignSelf: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  avatarPlaceholder: {
    backgroundColor: "#FF4081",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "bold",
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: "100%",
  },
  myMessageBubble: {
    backgroundColor: "#FF4081",
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  temporaryMessageBubble: {
    backgroundColor: "rgba(255, 64, 129, 0.7)",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#FFF",
  },
  theirMessageText: {
    color: "#000",
  },
  temporaryMessageText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontStyle: "italic",
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  theirMessageTime: {
    color: "#999",
  },
  temporaryMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
  inputContainer: {
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  inputWrapper: {
  flexDirection: "row",
  alignItems: "flex-end",
  marginTop: -100,
},
  textInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: "#000",
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF4081",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#CCC",
    shadowColor: "#000",
  },
  sendButtonIcon: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "bold",
  },
  charCounter: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
});