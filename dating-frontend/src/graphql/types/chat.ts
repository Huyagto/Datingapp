export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface MessagesResponse {
  messages: Message[];
}

export interface MessagesVariables {
  matchId: string;
}

export interface SendMessageResponse {
  sendMessage: Message;
}

export interface SendMessageVariables {
  matchId: string;
  text: string;
}
export interface OnMessageResponse {
  onMessage: Message;
}

export interface OnMessageVariables {
  matchId: string;
}
