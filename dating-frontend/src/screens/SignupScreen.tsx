import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { REGISTER } from "../graphql/auth";
import { RegisterResponse, RegisterVariables } from "../graphql/types/auth";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";

export default function SignupScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [register, { loading }] = useMutation<RegisterResponse, RegisterVariables>(REGISTER);

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên người dùng");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return false;
    }
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (!acceptTerms) {
      Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản sử dụng");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateForm()) return;

    try {
      const res = await register({
        variables: {
          input: {
            username,
            email,
            phone,
            password,
          },
        },
      });

      const token = res.data?.register.accessToken;
      if (!token) {
        Alert.alert("Lỗi", "Đăng ký không thành công");
        return;
      }

      await AsyncStorage.setItem("token", token);

      Alert.alert(
        "🎉 Đăng ký thành công!",
        "Hãy hoàn thiện hồ sơ của bạn để bắt đầu tìm kiếm",
        [
          {
            text: "Hoàn thiện ngay",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Main",
                    params: {
                      screen: "Profile",
                    },
                  },
                ],
              });
            },
          },
        ]
      );
    } catch (e: any) {
      console.log("❌ REGISTER ERROR", e);
      const errorMessage = e.message || "Đã xảy ra lỗi, vui lòng thử lại";
      Alert.alert("Đăng ký thất bại", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1e" />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tạo tài khoản</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Welcome section */}
          <View style={styles.welcomeContainer}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="account-plus"
                size={40}
                color="#FF4081"
              />
            </View>
            <Text style={styles.welcomeText}>Bắt đầu hành trình mới</Text>
            <Text style={styles.subtitleText}>
              Tạo tài khoản để kết nối với những người phù hợp
            </Text>
          </View>

          {/* Form container */}
          <View style={styles.formContainer}>
            {/* Username */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="account-outline"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Tên người dùng"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                editable={!loading}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Số điện thoại"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
                editable={!loading}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Mật khẩu"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="rgba(255, 255, 255, 0.6)"
                />
              </TouchableOpacity>
            </View>

            {/* Password requirement hint */}
            <Text style={styles.passwordHint}>
              ⓘ Mật khẩu phải có ít nhất 6 ký tự
            </Text>

            {/* Terms and conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                {acceptTerms && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="#FF4081"
                  />
                )}
              </View>
              <Text style={styles.termsText}>
                Tôi đồng ý với{" "}
                <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{" "}
                <Text style={styles.termsLink}>Chính sách bảo mật</Text>
              </Text>
            </TouchableOpacity>

            {/* Register button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (!acceptTerms || loading) && styles.registerButtonDisabled,
              ]}
              onPress={submit}
              disabled={!acceptTerms || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Đăng ký</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color="#FFF"
                    style={styles.buttonIcon}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc đăng ký với</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social signup options */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} disabled={loading}>
                <MaterialCommunityIcons
                  name="google"
                  size={24}
                  color="#FF4081"
                />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} disabled={loading}>
                <MaterialCommunityIcons
                  name="facebook"
                  size={24}
                  color="#FF4081"
                />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Login link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                disabled={loading}
              >
                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  welcomeContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 64, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 64, 129, 0.3)",
  },
  welcomeText: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: 30,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputIcon: {
    marginLeft: 15,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    paddingVertical: 18,
    paddingHorizontal: 15,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  passwordHint: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginBottom: 20,
    fontStyle: "italic",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: "#FF7B9D",
    textDecorationLine: "underline",
  },
  registerButton: {
    backgroundColor: "#FF4081",
    borderRadius: 15,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 25,
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonIcon: {
    marginTop: 2,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    paddingHorizontal: 15,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  socialText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  loginLink: {
    color: "#FF4081",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});