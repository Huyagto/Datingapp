// src/screens/ProfileScreen.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_MY_PROFILE } from "../graphql/profile";
import { GET_MY_PROFILE } from "../graphql/profile"; 

type Profile = {
  id: string;
  name: string;
  gender: string;
  bio: string;
  birthday: string;
  avatar?: string;
};
export default function ProfileScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [birthdayDate, setBirthdayDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2000);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0-11
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [scrolling, setScrolling] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: 0, label: "Tháng 1" },
    { value: 1, label: "Tháng 2" },
    { value: 2, label: "Tháng 3" },
    { value: 3, label: "Tháng 4" },
    { value: 4, label: "Tháng 5" },
    { value: 5, label: "Tháng 6" },
    { value: 6, label: "Tháng 7" },
    { value: 7, label: "Tháng 8" },
    { value: 8, label: "Tháng 9" },
    { value: 9, label: "Tháng 10" },
    { value: 10, label: "Tháng 11" },
    { value: 11, label: "Tháng 12" },
  ];

  // Tính số ngày trong tháng (cập nhật khi năm/tháng thay đổi)
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const [days, setDays] = useState<number[]>([]);

  // Cập nhật danh sách ngày khi năm/tháng thay đổi
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const newDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    setDays(newDays);
    
    // Nếu selectedDay lớn hơn số ngày trong tháng mới, reset về 1
    if (selectedDay > daysInMonth) {
      setSelectedDay(1);
    }
  }, [selectedYear, selectedMonth]);
  const { data: profileData } = useQuery<{ myProfile: Profile }>(GET_MY_PROFILE);
  const [updateProfile] = useMutation(UPDATE_MY_PROFILE);
  useEffect(() => {
    if (profileData?.myProfile) {
      const profile = profileData.myProfile;
      setName(profile.name || "");
      setGender(profile.gender || "");
      setBio(profile.bio || "");
      if (profile.birthday) {
        const date = new Date(profile.birthday);
        if (!isNaN(date.getTime())) {
          setBirthdayDate(date);
          setBirthday(date.toISOString().split('T')[0]);
          setSelectedYear(date.getFullYear());
          setSelectedMonth(date.getMonth());
          setSelectedDay(date.getDate());
          const daysInMonth = getDaysInMonth(date.getFullYear(), date.getMonth());
          const newDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
          setDays(newDays);
        }
      }
      setIsLoading(false);
    }
  }, [profileData]);
  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
  };
  const handleDateSelect = () => {
    setShowDatePicker(true);
  };

  const confirmDateSelection = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    const today = new Date();
    if (selectedDate > today) {
      Alert.alert("Lỗi", "Ngày sinh không thể là ngày trong tương lai");
      return;
    }
    
    const age = today.getFullYear() - selectedYear;
    if (age < 18) {
      Alert.alert("Lỗi", "Bạn phải từ 18 tuổi trở lên");
      return;
    }
    
    if (age > 100) {
      Alert.alert("Lỗi", "Vui lòng nhập ngày sinh hợp lệ");
      return;
    }
    
    setBirthdayDate(selectedDate);
    setBirthday(selectedDate.toISOString().split('T')[0]);
    setShowDatePicker(false);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên của bạn");
      return false;
    }
    
    if (!gender) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn giới tính");
      return false;
    }
    
    return true;
  };

  const submit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const input: any = {
        name: name.trim(),
        gender,
        bio: bio.trim(),
      };
      if (birthdayDate) {
        input.birthday = birthdayDate.toISOString();
      }
      
      await updateProfile({
        variables: { input },
      });
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
      
    } catch (e: any) {
      console.log("❌ UPDATE PROFILE ERROR", e);
      Alert.alert(
        "Lỗi", 
        e.message || "Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 Render item cho picker với chức năng chọn
  const renderPickerItem = ({ 
    item, 
    isSelected, 
    onPress 
  }: { 
    item: any, 
    isSelected: boolean,
    onPress: () => void 
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.pickerItem,
        isSelected && styles.pickerItemSelected
      ]}>
        <Text style={[
          styles.pickerItemText,
          isSelected && styles.pickerItemTextSelected
        ]}>
          {typeof item === 'object' ? item.label : item}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // 🔥 Handler cho scroll picker
const ITEM_HEIGHT = 40;
const PADDING_TOP = 80;

const handleScrollEnd = (
  type: 'year' | 'month' | 'day',
  offsetY: number
) => {
  const index = Math.floor((offsetY - PADDING_TOP) / ITEM_HEIGHT);

  if (index < 0) return;

  if (type === 'year' && index < years.length) {
    setSelectedYear(years[index]);
  }

  if (type === 'month' && index < months.length) {
    setSelectedMonth(months[index].value);
  }

  if (type === 'day' && index < days.length) {
    setSelectedDay(days[index]);
  }
};


  // 🔥 Hiển thị loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <ActivityIndicator size="large" color="#FF4081" />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hoàn thiện hồ sơ</Text>
          <Text style={styles.headerSubtitle}>
            Thông tin càng chi tiết, cơ hội match càng cao
          </Text>
        </View>

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {name ? name.charAt(0).toUpperCase() : "👤"}
              </Text>
            </View>
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>📷 Thay đổi ảnh</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Tên */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên của bạn *</Text>
            <TextInput
              placeholder="Nhập tên của bạn"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              style={styles.input}
              maxLength={50}
            />
            <Text style={styles.charCount}>{name.length}/50</Text>
          </View>

          {/* Giới tính */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính *</Text>
            <View style={styles.genderContainer}>
              {["Nam", "Nữ", "Khác"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderOption,
                    gender === g && styles.genderOptionSelected
                  ]}
                  onPress={() => handleGenderSelect(g)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.genderText,
                    gender === g && styles.genderTextSelected
                  ]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ngày sinh */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={handleDateSelect}
              activeOpacity={0.7}
            >
              <Text style={birthday ? styles.dateInputText : styles.dateInputPlaceholder}>
                {birthday ? formatDisplayDate(birthday) : "Chọn ngày sinh"}
              </Text>
              <Text style={styles.dateIcon}>📅</Text>
            </TouchableOpacity>
            <Text style={styles.hintText}>
              ⓘ Bạn phải từ 18 tuổi trở lên
            </Text>
          </View>

          {/* Giới thiệu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới thiệu bản thân</Text>
            <TextInput
              placeholder="Hãy chia sẻ một chút về bản thân, sở thích, tính cách..."
              placeholderTextColor="#999"
              value={bio}
              onChangeText={setBio}
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>
            <Text style={styles.hintText}>
              Mô tả càng chi tiết càng thu hút người khác
            </Text>
          </View>

          {/* Thông tin bổ sung (có thể thêm sau) */}
          <View style={styles.moreInfoSection}>
            <Text style={styles.moreInfoTitle}>Thông tin bổ sung</Text>
            <Text style={styles.moreInfoText}>
              Bạn có thể thêm sở thích, công việc, chiều cao... sau trong phần cài đặt
            </Text>
          </View>

          {/* Nút submit */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!name || !gender) && styles.submitButtonDisabled
            ]}
            onPress={submit}
            disabled={!name || !gender || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Lưu & Bắt đầu khám phá</Text>
                <Text style={styles.submitButtonIcon}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Lưu ý */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              ⓘ Thông tin của bạn sẽ được bảo mật và chỉ hiển thị với những người bạn đã match
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Custom Date Picker Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
              <TouchableOpacity 
                onPress={confirmDateSelection}
                style={styles.modalConfirmButton}
              >
                <Text style={styles.modalConfirmText}>Xong</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerContainer}>
              {/* Năm */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Năm</Text>
                <FlatList
                  data={years}
                  keyExtractor={(item) => item.toString()}
                  showsVerticalScrollIndicator={false}
                  style={styles.pickerList}
                  contentContainerStyle={styles.pickerListContent}
                  snapToInterval={40}
                  decelerationRate="fast"
                  onScrollBeginDrag={() => setScrolling(true)}
                  onMomentumScrollEnd={(e) => handleScrollEnd('year', e.nativeEvent.contentOffset.y)}
                  renderItem={({ item }) => renderPickerItem({
                    item,
                    isSelected: item === selectedYear,
                    onPress: () => setSelectedYear(item)
                  })}
                  getItemLayout={(data, index) => ({
                    length: 40,
                    offset: 40 * index,
                    index,
                  })}
                  initialScrollIndex={years.findIndex(y => y === selectedYear)}
                />
              </View>

              {/* Tháng */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Tháng</Text>
                <FlatList
                  data={months}
                  keyExtractor={(item) => item.value.toString()}
                  showsVerticalScrollIndicator={false}
                  style={styles.pickerList}
                  contentContainerStyle={styles.pickerListContent}
                  snapToInterval={40}
                  decelerationRate="fast"
                  onScrollBeginDrag={() => setScrolling(true)}
                  onMomentumScrollEnd={(e) => handleScrollEnd('month', e.nativeEvent.contentOffset.y)}
                  renderItem={({ item }) => renderPickerItem({
                    item,
                    isSelected: item.value === selectedMonth,
                    onPress: () => setSelectedMonth(item.value)
                  })}
                  getItemLayout={(data, index) => ({
                    length: 40,
                    offset: 40 * index,
                    index,
                  })}
                  initialScrollIndex={days.findIndex(d => d === selectedMonth)}

                />
              </View>

              {/* Ngày */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Ngày</Text>
                <FlatList
                  data={days}
                  keyExtractor={(item) => item.toString()}
                  showsVerticalScrollIndicator={false}
                  style={styles.pickerList}
                  contentContainerStyle={styles.pickerListContent}
                  snapToInterval={40}
                  decelerationRate="fast"
                  onScrollBeginDrag={() => setScrolling(true)}
                  onMomentumScrollEnd={(e) => handleScrollEnd('day', e.nativeEvent.contentOffset.y)}
                  renderItem={({ item }) => renderPickerItem({
                    item,
                    isSelected: item === selectedDay,
                    onPress: () => setSelectedDay(item)
                  })}
                  getItemLayout={(data, index) => ({
                    length: 40,
                    offset: 40 * index,
                    index,
                  })}
                  initialScrollIndex={days.findIndex(d => d === selectedDay)}
                />
              </View>
            </View>

            {/* Highlight line */}
            <View style={styles.pickerHighlight} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 40,
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
  header: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF4081",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 42,
    color: "#FFF",
    fontWeight: "bold",
  },
  changeAvatarButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  changeAvatarText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  formContainer: {
    paddingHorizontal: 25,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#FFF",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#FFF",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: "#000",
  },
  dateInputPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  dateIcon: {
    fontSize: 18,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    fontStyle: "italic",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 10,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  genderOptionSelected: {
    backgroundColor: "#FF4081",
    borderColor: "#FF4081",
  },
  genderText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  genderTextSelected: {
    color: "#FFF",
    fontWeight: "600",
  },
  moreInfoSection: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  moreInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  moreInfoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#FF4081",
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  submitButtonIcon: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  noteContainer: {
    backgroundColor: "#FFF8F8",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  noteText: {
    fontSize: 13,
    color: "#FF4081",
    lineHeight: 18,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalConfirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#FF4081',
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 200,
    paddingVertical: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerList: {
    flex: 1,
    width: '100%',
  },
  pickerListContent: {
    paddingVertical: 80,
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  pickerItemSelected: {
    backgroundColor: '#FF4081',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  pickerItemText: {
    fontSize: 16,
    color: '#666',
  },
  pickerItemTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  pickerHighlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255, 64, 129, 0.1)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FF4081',
    transform: [{ translateY: -20 }],
    zIndex: -1,
  },
});