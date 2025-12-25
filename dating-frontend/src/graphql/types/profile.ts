type Profile = {
  id: string;
  name: string;
  gender: string;
  bio: string;
  birthday: string;
  interests?: string[]; // 🔥 Thêm interests
  avatar?: string;
};