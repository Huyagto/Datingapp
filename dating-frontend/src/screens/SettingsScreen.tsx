// src/screens/SettingsScreen.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Switch,
} from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Start' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Xóa tài khoản",
      "Hành động này sẽ xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn. Bạn có chắc chắn?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa tài khoản", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Đang phát triển", "Tính năng đang được phát triển");
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>👤</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Hồ sơ của tôi</Text>
              <Text style={styles.settingDescription}>Chỉnh sửa thông tin cá nhân</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>🔒</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Bảo mật</Text>
              <Text style={styles.settingDescription}>Mật khẩu và xác thực</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>👁️</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Quyền riêng tư</Text>
              <Text style={styles.settingDescription}>Ai có thể xem hồ sơ của bạn</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ứng dụng</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>🔔</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Thông báo</Text>
              <Text style={styles.settingDescription}>Nhận thông báo từ HeartLink</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E0E0E0', true: '#FF4081' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>🌙</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Chế độ tối</Text>
              <Text style={styles.settingDescription}>Giao diện tối cho buổi tối</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E0E0E0', true: '#FF4081' }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>🌍</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Ngôn ngữ</Text>
              <Text style={styles.settingDescription}>Tiếng Việt</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>❓</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Trung tâm trợ giúp</Text>
              <Text style={styles.settingDescription}>Câu hỏi thường gặp</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>📞</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Liên hệ hỗ trợ</Text>
              <Text style={styles.settingDescription}>Gửi phản hồi và báo cáo</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>📖</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Điều khoản dịch vụ</Text>
              <Text style={styles.settingDescription}>Chính sách và điều khoản</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vùng nguy hiểm</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleDeleteAccount}
          >
            <View style={[styles.settingIconContainer, styles.dangerIconContainer]}>
              <Text style={[styles.settingIcon, styles.dangerIcon]}>🗑️</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, styles.dangerText]}>Xóa tài khoản</Text>
              <Text style={[styles.settingDescription, styles.dangerDescription]}>
                Xóa vĩnh viễn tài khoản và dữ liệu
              </Text>
            </View>
          </TouchableOpacity>

          {/* 🔥 NÚT ĐĂNG XUẤT */}
          <TouchableOpacity 
            style={[styles.settingItem, styles.logoutItem]}
            onPress={() => {
              Alert.alert(
                "Đăng xuất",
                "Bạn có chắc chắn muốn đăng xuất?",
                [
                  { text: "Hủy", style: "cancel" },
                  { 
                    text: "Đăng xuất", 
                    style: "destructive",
                    onPress: handleLogout 
                  }
                ]
              );
            }}
          >
            <View style={[styles.settingIconContainer, styles.logoutIconContainer]}>
              <Text style={[styles.settingIcon, styles.logoutIcon]}>🚪</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, styles.logoutText]}>Đăng xuất</Text>
              <Text style={[styles.settingDescription, styles.logoutDescription]}>
                Thoát khỏi tài khoản hiện tại
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>HeartLink</Text>
          <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 HeartLink. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: "#FFF",
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F8F8F8",
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
  },
  chevron: {
    fontSize: 20,
    color: "#BDBDBD",
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Danger/Logout Styles
  dangerItem: {
    borderTopColor: "#FFE0E0",
  },
  dangerIconContainer: {
    backgroundColor: "#FFE0E0",
  },
  dangerIcon: {
    color: "#FF4081",
  },
  dangerText: {
    color: "#FF4081",
  },
  dangerDescription: {
    color: "#FF7B9D",
  },
  logoutItem: {
    borderTopColor: "#F0F0F0",
  },
  logoutIconContainer: {
    backgroundColor: "#F5F5F5",
  },
  logoutIcon: {
    color: "#666",
  },
  logoutText: {
    color: "#666",
  },
  logoutDescription: {
    color: "#999",
  },
  appInfo: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF4081",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  appCopyright: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});