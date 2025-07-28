// 채널 정보
export interface ChatChannelDto {
  channelId: number;
  cmsCode: string;
  cmsName: string;
  unreadCount: number;
}

// 채팅방 정보
export interface ChatThreadDto {
  threadId: number;
  userName: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}

// 채팅 메시지
export interface ChatMessageDto {
  id?: number;
  threadId: number;
  content: string;
  senderType: 'USER' | 'ADMIN';
  senderName: string;
  messageType: 'TEXT' | 'FILE';
  fileName?: string;
  fileUrl?: string;
  isRead?: boolean;
  readAt?: string;
  createdAt?: string;
}

// 메시지 전송 요청
export interface SendMessageRequest {
  threadId: number;
  content: string;
  senderType: 'USER' | 'ADMIN';
  senderName: string;
  messageType: 'TEXT' | 'FILE';
  fileName?: string;
  fileUrl?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
} 