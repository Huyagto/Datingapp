import { User } from "./users";

export type Match = {
  id: string;
  userA: User;
  userB: User;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string; 
  };
  unreadCount?: number;
};