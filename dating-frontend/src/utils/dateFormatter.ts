// src/utils/dateFormatter.ts
export const formatTime = (dateString: string): string => {
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

export const formatDateHeader = (dateString: string): string => {
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

export const formatMessageDate = (dateString: string): string => {
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