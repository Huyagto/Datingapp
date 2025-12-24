// utils/colors.ts

/**
 * Tạo màu ngẫu nhiên dựa trên seed (thường là userId)
 * @param seed - Chuỗi để tạo màu (userId, username, etc.)
 * @returns Màu hex string
 */
export const getRandomColor = (seed?: string): string => {
  // Danh sách màu đẹp, phù hợp với avatar placeholder
  const colors = [
    "#FF4081", "#FF5252", "#FF6E40", "#FF8F00", // Hồng/Đỏ/Cam
    "#2196F3", "#03A9F4", "#00BCD4", "#0097A7", // Xanh dương
    "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", // Xanh lá/Vàng
    "#9C27B0", "#673AB7", "#3F51B5", "#303F9F", // Tím
    "#795548", "#607D8B", "#9E9E9E", "#757575", // Nâu/Xám
  ];
  
  // Nếu không có seed hoặc seed rỗng, dùng màu mặc định
  if (!seed || seed.trim() === "") {
    return "#FF4081"; // Màu chủ đạo của app
  }
  
  try {
    // Tạo hash từ seed để có màu ổn định cho cùng seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Đảm bảo index không vượt quá độ dài mảng
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  } catch (error) {
    console.error("Error generating color:", error);
    return "#FF4081"; // Màu fallback
  }
};

/**
 * Tạo gradient background dựa trên seed
 * @param seed - Chuỗi để tạo gradient
 * @returns Mảng màu gradient
 */
export const getRandomGradient = (seed?: string): string[] => {
  const gradients = [
    ["#FF4081", "#FF6B95"],
    ["#2196F3", "#21CBF3"],
    ["#4CAF50", "#8BC34A"],
    ["#FF9800", "#FFC107"],
    ["#9C27B0", "#E91E63"],
    ["#00BCD4", "#009688"],
    ["#673AB7", "#9575CD"],
    ["#795548", "#A1887F"],
  ];
  
  if (!seed || seed.trim() === "") {
    return gradients[0];
  }
  
  try {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  } catch (error) {
    return gradients[0];
  }
};

/**
 * Lấy màu chủ đạo cho status (online/offline)
 * @param status - Trạng thái online/offline
 * @returns Màu hex string
 */
export const getStatusColor = (status: 'online' | 'offline' | 'away'): string => {
  switch (status) {
    case 'online':
      return "#4CAF50"; // Xanh lá - đang online
    case 'away':
      return "#FF9800"; // Cam - đang away
    case 'offline':
    default:
      return "#9E9E9E"; // Xám - offline
  }
};

/**
 * Lấy màu cho unread badge dựa trên số lượng
 * @param count - Số lượng unread
 * @returns Màu hex string
 */
export const getUnreadBadgeColor = (count: number): string => {
  if (count === 0) return "transparent";
  if (count <= 3) return "#FF4081"; // Hồng nhạt cho ít tin
  if (count <= 10) return "#FF5252"; // Đỏ nhạt cho trung bình
  return "#D32F2F"; // Đỏ đậm cho nhiều tin
};

/**
 * Tạo màu tương phản với background (cho text)
 * @param backgroundColor - Màu nền dạng hex
 * @returns 'black' hoặc 'white'
 */
export const getContrastColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white depending on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Làm sáng hoặc tối màu
 * @param color - Màu gốc dạng hex
 * @param percent - Phần trăm (-100 đến 100)
 * @returns Màu hex đã điều chỉnh
 */
export const adjustColorBrightness = (color: string, percent: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  
  let r = (num >> 16) + Math.round(percent * 2.55);
  let g = ((num >> 8) & 0x00FF) + Math.round(percent * 2.55);
  let b = (num & 0x0000FF) + Math.round(percent * 2.55);
  
  // Giới hạn giá trị trong khoảng 0-255
  r = Math.min(Math.max(0, r), 255);
  g = Math.min(Math.max(0, g), 255);
  b = Math.min(Math.max(0, b), 255);
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Lấy màu cho message bubble
 * @param isMe - Có phải tin nhắn của mình không
 * @param type - Loại tin nhắn
 * @returns Màu hex string
 */
export const getMessageBubbleColor = (
  isMe: boolean, 
  type: 'text' | 'image' | 'system' = 'text'
): string => {
  if (type === 'system') {
    return '#F5F5F5'; // Màu xám nhạt cho tin hệ thống
  }
  
  if (isMe) {
    return '#FF4081'; // Màu chủ đạo cho tin của mình
  }
  
  return '#F0F0F0'; // Màu xám nhạt cho tin đối phương
};

/**
 * Lấy màu text cho message bubble
 * @param isMe - Có phải tin nhắn của mình không
 * @param type - Loại tin nhắn
 * @returns Màu hex string
 */
export const getMessageTextColor = (
  isMe: boolean, 
  type: 'text' | 'image' | 'system' = 'text'
): string => {
  if (type === 'system') {
    return '#666666'; // Xám đậm cho tin hệ thống
  }
  
  if (isMe) {
    return '#FFFFFF'; // Trắng cho tin của mình
  }
  
  return '#000000'; // Đen cho tin đối phương
};

// Export default cho tiện import
export default {
  getRandomColor,
  getRandomGradient,
  getStatusColor,
  getUnreadBadgeColor,
  getContrastColor,
  adjustColorBrightness,
  getMessageBubbleColor,
  getMessageTextColor,
};