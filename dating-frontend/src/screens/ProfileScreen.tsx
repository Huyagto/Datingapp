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
import { UPDATE_MY_PROFILE, GET_MY_PROFILE } from "../graphql/profile";

type Profile = {
  id: string;
  name: string;
  gender: string;
  bio: string;
  birthday: string;
  interests?: string[]; // 🔥 Thêm interests
  avatar?: string;
};

// 🔥 DANH SÁCH SỞ THÍCH MẪU
const INTEREST_CATEGORIES = [
  {
    id: "sports",
    name: "Thể thao",
    interests: ["⚽ Bóng đá", "🏸 Cầu lông", "🏊 Bơi lội", "💪 Gym", "🧘 Yoga", "🏃 Chạy bộ", "🏀 Bóng rổ", "🎾 Tennis", "🚴 Đạp xe"],
  },
  {
    id: "music",
    name: "Âm nhạc",
    interests: ["🎵 Pop", "🎸 Rock", "🎧 EDM", "🎤 Hip-hop", "🎼 Indie", "🎶 Acoustic", "🎻 Cổ điển", "🎹 Jazz", "🎺 R&B"],
  },
  {
    id: "food",
    name: "Ẩm thực",
    interests: ["🍜 Đồ ăn Việt", "🍱 Hàn Quốc", "🍣 Nhật Bản", "🍕 Italy", "🥗 Đồ chay", "☕ Cà phê", "🍰 Bánh ngọt", "🍲 Lẩu", "🍢 BBQ"],
  },
  {
    id: "travel",
    name: "Du lịch",
    interests: ["🏕️ Phượt", "🏖️ Biển", "⛰️ Núi", "🏙️ Thành phố", "🏮 Văn hóa", "🍜 Ẩm thực địa phương", "📷 Check-in", "🏛️ Di tích", "✈️ Nước ngoài"],
  },
  {
    id: "entertainment",
    name: "Giải trí",
    interests: ["🎬 Xem phim", "📚 Đọc sách", "🎮 Game", "🛍️ Shopping", "☕ Cafe", "🎉 Tiệc", "📺 Series", "🎤 Karaoke", "🎪 Concert"],
  },
  {
    id: "learning",
    name: "Học tập",
    interests: ["💻 Công nghệ", "📈 Kinh doanh", "🗣️ Ngoại ngữ", "🎨 Nghệ thuật", "🔬 Khoa học", "📱 Lập trình", "📖 Văn học", "🧠 Tâm lý", "💼 Kỹ năng mềm"],
  },
  {
    id: "lifestyle",
    name: "Lối sống",
    interests: ["🐶 Thú cưng", "🌿 Thiên nhiên", "🏠 Nấu ăn", "🧵 Thủ công", "🎁 Mua sắm", "📸 Chụp ảnh", "💄 Làm đẹp", "🧘 Thiền", "✍️ Viết lách"],
  },
  {
    id: "others",
    name: "Khác",
    interests: ["🎭 Kịch", "♟️ Cờ vua", "🎯 Bắn cung", "🏹 Bắn nỏ", "🛹 Trượt ván", "🧩 Puzzle", "🍷 Rượu vang", "🌮 Street food", "🎨 Vẽ tranh"],
  },
];

export default function ProfileScreen({ navigation }: any) {
  // State
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [birthdayDate, setBirthdayDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2000);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  
  // 🔥 State cho sở thích
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [tempSelectedInterests, setTempSelectedInterests] = useState<string[]>([]);

  // GraphQL queries and mutations
  const { data: profileData, loading, error } = useQuery<{ myProfile: Profile }>(
    GET_MY_PROFILE,
    {
      fetchPolicy: "network-only",
    }
  );
  
  const [updateProfile] = useMutation(UPDATE_MY_PROFILE, {
    onCompleted: () => {
      Alert.alert(
        "Thành công",
        "Hồ sơ đã được cập nhật!",
        [
          {
            text: "OK",
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            })
          }
        ]
      );
    },
    onError: (e) => {
      console.log("❌ UPDATE PROFILE ERROR", e);
      Alert.alert(
        "Lỗi",
        e.message || "Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại."
      );
    },
  });

  // Date picker data
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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const [days, setDays] = useState<number[]>([]);
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const newDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    setDays(newDays);
    
    if (selectedDay > daysInMonth) {
      setSelectedDay(1);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    console.log("Profile data:", profileData);
    console.log("Loading:", loading);
    console.log("Error:", error);
    
    if (profileData?.myProfile) {
      const profile = profileData.myProfile;
      console.log("Setting profile data:", profile);
      
      setName(profile.name || "");
      setGender(profile.gender || "Nam"); 
      setBio(profile.bio || "");
      
      // 🔥 Set interests từ server
      if (profile.interests && profile.interests.length > 0) {
        setSelectedInterests(profile.interests);
      }
      
      if (profile.birthday) {
        try {
          const date = new Date(profile.birthday);
          if (!isNaN(date.getTime())) {
            setBirthdayDate(date);
            setBirthday(date.toISOString().split('T')[0]);
            setSelectedYear(date.getFullYear());
            setSelectedMonth(date.getMonth());
            setSelectedDay(date.getDate());
          } else {
            console.warn("Invalid birthday date:", profile.birthday);
          }
        } catch (e) {
          console.error("Error parsing birthday:", e);
        }
      }
      
      setIsLoading(false);
    } else if (!loading) {
      if (error) {
        console.error("Error loading profile:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin hồ sơ. Vui lòng thử lại.");
      }
      setIsLoading(false);
    }
  }, [profileData, loading, error]);

  // 🔥 Xử lý sở thích
  const handleInterestPress = (interest: string) => {
    // Loại bỏ emoji để lấy text
    const interestText = interest.replace(/^[^\w\s]+\s/, "");
    
    setTempSelectedInterests(prev => {
      if (prev.includes(interestText)) {
        return prev.filter(i => i !== interestText);
      } else {
        if (prev.length >= 10) {
          Alert.alert("Giới hạn", "Bạn chỉ có thể chọn tối đa 10 sở thích");
          return prev;
        }
        return [...prev, interestText];
      }
    });
  };

  const openInterestsModal = () => {
    setTempSelectedInterests([...selectedInterests]);
    setShowInterestsModal(true);
  };

  const saveInterests = () => {
    if (tempSelectedInterests.length < 3) {
      Alert.alert(
        "Thiếu sở thích",
        "Vui lòng chọn ít nhất 3 sở thích để tìm người phù hợp hơn",
        [{ text: "OK" }]
      );
      return;
    }
    
    setSelectedInterests([...tempSelectedInterests]);
    setShowInterestsModal(false);
  };

  // 🔥 Render interest chip
  const renderInterestChip = (interest: string, isModal = false) => {
    const interestText = interest.replace(/^[^\w\s]+\s/, "");
    const isSelected = isModal 
      ? tempSelectedInterests.includes(interestText)
      : selectedInterests.includes(interestText);
    
    return (
      <TouchableOpacity
        key={interest}
        style={[
          styles.interestChip,
          isSelected && styles.interestChipSelected
        ]}
        onPress={() => isModal ? handleInterestPress(interest) : {}}
        disabled={!isModal}
      >
        <Text style={[
          styles.interestText,
          isSelected && styles.interestTextSelected
        ]}>
          {interest}
        </Text>
        {isSelected && (
          <Text style={styles.interestCheck}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  // 🔥 Render interest category
  const renderInterestCategory = (category: any) => (
    <View key={category.id} style={styles.interestCategory}>
      <Text style={styles.categoryTitle}>{category.name}</Text>
      <View style={styles.interestsContainer}>
        {category.interests.map((interest: string) => 
          renderInterestChip(interest, true)
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <ActivityIndicator size="large" color="#FF4081" />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorText}>Không thể tải thông tin hồ sơ</Text>
        <Text style={styles.errorSubtext}>Vui lòng kiểm tra kết nối mạng</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setIsLoading(true)}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
  };

  const handleDateSelect = () => {
    setShowDatePicker(true);
  };

  // Confirm date selection
  const confirmDateSelection = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    const today = new Date();
    
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
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
    
    if (selectedInterests.length < 3) {
      Alert.alert(
        "Thiếu sở thích",
        "Vui lòng chọn ít nhất 3 sở thích để tìm người phù hợp hơn",
        [
          { text: "Để sau", style: "cancel" },
          { text: "Chọn ngay", onPress: openInterestsModal }
        ]
      );
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
        interests: selectedInterests, // 🔥 Gửi interests
      };
      
      if (birthdayDate) {
        input.birthday = birthdayDate.toISOString();
      }
      
      await updateProfile({
        variables: { input },
      });
      
    } catch (e: any) {
      console.log("❌ UPDATE PROFILE ERROR", e);
      Alert.alert(
        "Lỗi", 
        e.message || "Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại."
      );
      setIsSubmitting(false);
    }
  };

  // 🔥 Simple picker item
  const PickerItem = ({ 
    label, 
    isSelected,
    onPress 
  }: { 
    label: string; 
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pickerItem,
        isSelected && styles.pickerItemSelected
      ]}
    >
      <Text style={[
        styles.pickerItemText,
        isSelected && styles.pickerItemTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // 🔥 Picker Column Component
  const PickerColumn = ({ 
    title, 
    items, 
    selectedValue,
    onSelect,
    isMonth = false
  }: { 
    title: string;
    items: any[];
    selectedValue: number;
    onSelect: (value: number) => void;
    isMonth?: boolean;
  }) => (
    <View style={styles.pickerColumn}>
      <Text style={styles.pickerLabel}>{title}</Text>
      <ScrollView
        style={styles.pickerScroll}
        contentContainerStyle={styles.pickerScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item, index) => {
          const value = isMonth ? item.value : item;
          const label = isMonth ? item.label : item.toString();
          const isSelected = value === selectedValue;
          
          return (
            <PickerItem
              key={index}
              label={label}
              isSelected={isSelected}
              onPress={() => onSelect(value)}
            />
          );
        })}
      </ScrollView>
    </View>
  );

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

          {/* 🔥 SỞ THÍCH */}
          <View style={styles.inputGroup}>
            <View style={styles.interestsHeader}>
              <Text style={styles.label}>Sở thích của bạn *</Text>
              <TouchableOpacity onPress={openInterestsModal}>
                <Text style={styles.editInterestsButton}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
            
            {selectedInterests.length > 0 ? (
              <View style={styles.selectedInterestsContainer}>
                {selectedInterests.slice(0, 8).map((interest, index) => (
                  <View key={index} style={styles.selectedInterestChip}>
                    <Text style={styles.selectedInterestText}>{interest}</Text>
                  </View>
                ))}
                {selectedInterests.length > 8 && (
                  <View style={styles.moreInterestsChip}>
                    <Text style={styles.moreInterestsText}>
                      +{selectedInterests.length - 8}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addInterestsButton}
                onPress={openInterestsModal}
                activeOpacity={0.7}
              >
                <Text style={styles.addInterestsIcon}>+</Text>
                <Text style={styles.addInterestsText}>Thêm sở thích của bạn</Text>
              </TouchableOpacity>
            )}
            
            <Text style={styles.interestsHint}>
              ⓘ Chọn ít nhất 3 sở thích để tìm người phù hợp (Đã chọn: {selectedInterests.length}/10)
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

          {/* Nút submit */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!name || !gender || selectedInterests.length < 3) && styles.submitButtonDisabled
            ]}
            onPress={submit}
            disabled={!name || !gender || selectedInterests.length < 3 || isSubmitting}
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

      {/* 🔥 MODAL CHỌN SỞ THÍCH */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showInterestsModal}
        onRequestClose={() => setShowInterestsModal(false)}
      >
        <View style={styles.interestsModalOverlay}>
          <View style={styles.interestsModalContainer}>
            {/* Header */}
            <View style={styles.interestsModalHeader}>
              <TouchableOpacity 
                onPress={() => setShowInterestsModal(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <View style={styles.interestsModalTitleContainer}>
                <Text style={styles.interestsModalTitle}>Sở thích của bạn</Text>
                <Text style={styles.interestsModalSubtitle}>
                  Đã chọn: {tempSelectedInterests.length}/10
                </Text>
              </View>
              <TouchableOpacity 
                onPress={saveInterests}
                style={styles.modalConfirmButton}
              >
                <Text style={styles.modalConfirmText}>Lưu</Text>
              </TouchableOpacity>
            </View>
            
            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Chọn sở thích để tìm người phù hợp hơn. Bạn có thể chọn tối đa 10 sở thích.
              </Text>
              {tempSelectedInterests.length < 3 && (
                <Text style={styles.minInterestsWarning}>
                  ⚠️ Vui lòng chọn ít nhất 3 sở thích
                </Text>
              )}
            </View>
            
            {/* Selected preview */}
            {tempSelectedInterests.length > 0 && (
              <View style={styles.tempSelectedContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {tempSelectedInterests.map((interest, index) => (
                    <View key={index} style={styles.tempSelectedChip}>
                      <Text style={styles.tempSelectedText}>{interest}</Text>
                      <TouchableOpacity 
                        style={styles.removeInterestButton}
                        onPress={() => {
                          setTempSelectedInterests(prev => 
                            prev.filter(i => i !== interest)
                          );
                        }}
                      >
                        <Text style={styles.removeInterestText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {/* Interests List */}
            <FlatList
              data={INTEREST_CATEGORIES}
              renderItem={({ item }) => renderInterestCategory(item)}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.interestsListContent}
            />
          </View>
        </View>
      </Modal>

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
              <PickerColumn
                title="Năm"
                items={years}
                selectedValue={selectedYear}
                onSelect={(value) => setSelectedYear(value)}
              />
              
              <PickerColumn
                title="Tháng"
                items={months}
                selectedValue={selectedMonth}
                onSelect={(value) => setSelectedMonth(value)}
                isMonth={true}
              />
              
              <PickerColumn
                title="Ngày"
                items={days}
                selectedValue={selectedDay}
                onSelect={(value) => setSelectedDay(value)}
              />
            </View>

            {/* Selected date preview */}
            <View style={styles.selectedDatePreview}>
              <Text style={styles.selectedDateText}>
                {selectedDay}/{selectedMonth + 1}/{selectedYear}
              </Text>
            </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: "#FF4081",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
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
    height: 400,
    paddingBottom: 30,
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
    height: 250,
    marginTop: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontWeight: '600',
  },
  pickerScroll: {
    width: '100%',
  },
  pickerScrollContent: {
    paddingVertical: 100,
    paddingHorizontal: 10,
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  pickerItemSelected: {
    backgroundColor: '#FF4081',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#666',
  },
  pickerItemTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  selectedDatePreview: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    marginHorizontal: 20,
    borderRadius: 10,
  },
  selectedDateText: {
    fontSize: 18,
    color: '#FF4081',
    fontWeight: 'bold',
  },

  // 🔥 NEW STYLES FOR INTERESTS
  interestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  editInterestsButton: {
    fontSize: 14,
    color: '#FF4081',
    fontWeight: '600',
  },
  selectedInterestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedInterestChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  selectedInterestText: {
    fontSize: 14,
    color: '#333',
  },
  moreInterestsChip: {
    backgroundColor: '#FF4081',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  moreInterestsText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  addInterestsButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  addInterestsIcon: {
    fontSize: 20,
    color: '#FF4081',
    marginRight: 8,
  },
  addInterestsText: {
    fontSize: 16,
    color: '#666',
  },
  interestsHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  interestsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  interestsModalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    marginTop: Platform.OS === 'ios' ? 50 : 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  interestsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  interestsModalTitleContainer: {
    alignItems: 'center',
  },
  interestsModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  interestsModalSubtitle: {
    fontSize: 14,
    color: '#FF4081',
    marginTop: 4,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  minInterestsWarning: {
    fontSize: 14,
    color: '#FF4081',
    fontWeight: '600',
    marginTop: 8,
  },
  tempSelectedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tempSelectedChip: {
    backgroundColor: '#FF4081',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempSelectedText: {
    fontSize: 14,
    color: '#FFF',
    marginRight: 6,
  },
  removeInterestButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeInterestText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  interestCategory: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestChipSelected: {
    backgroundColor: '#FF4081',
  },
  interestText: {
    fontSize: 14,
    color: '#333',
  },
  interestTextSelected: {
    color: '#FFF',
  },
  interestCheck: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  interestsListContent: {
    paddingBottom: 30,
  },
  // 🔥 Xóa phần moreInfoSection vì đã có interests
});