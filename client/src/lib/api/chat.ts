import { ChatChannelDto, ChatThreadDto, ChatMessageDto, SendMessageRequest, ApiResponse } from '@/types/api/chat';
import { privateApi, publicApi } from './client';


// API 기본 URL 설정 (환경 변수에서 가져오기)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export const chatApi = {
  // 채널 관련
  getChannels: () =>
    publicApi.get<ApiResponse<ChatChannelDto[]>>(`/chat/channels`),

  // 채팅방 관련
  getThreads: (channelId?: number) =>
    publicApi.get<ApiResponse<ChatThreadDto[]>>(
      channelId ? `/chat/channels/${channelId}/threads` : `/chat/threads`
    ),

  // 메시지 관련
  getMessages: (threadId: number) =>
    publicApi.get<ApiResponse<ChatMessageDto[]>>(`/chat/threads/${threadId}/messages`),

  sendMessage: (data: SendMessageRequest) =>
    publicApi.post<ApiResponse<ChatMessageDto>>(`/chat/messages`, data),

  // 읽음 처리
  markAsRead: (threadId: number, messageId: number) =>
    publicApi.put<ApiResponse<void>>(`/chat/threads/${threadId}/messages/${messageId}/read`),

  // 파일 업로드 (현재는 제외)
  // uploadFile: (threadId: number, file: File) => {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   return publicApi.post<ApiResponse<{ fileName: string; fileUrl: string }>>(
  //     `/chat/threads/${threadId}/files`,
  //     formData,
  //     {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     }
  //   );
  // },
};

// axios 인스턴스 설정
export const setupChatApi = (cmsCode: string, userToken?: string) => {
  // 요청 인터셉터
  publicApi.interceptors.request.use((config) => {
    // CMS 코드를 헤더에 추가
    config.headers['X-CMS-Code'] = cmsCode;
    
    // 인증 토큰이 있다면 추가
    if (userToken) {
      config.headers['Authorization'] = `Bearer ${userToken}`;
    }
    
    return config;
  });

  // 응답 인터셉터
  publicApi.interceptors.response.use(
    (response) => {
      // API 응답 구조 변환
      return {
        ...response,
        data: {
          success: true,
          data: response.data,
        },
      };
    },
    (error) => {
      // 에러 응답 구조 변환
      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: {
            success: false,
            error: error.response?.data?.message || '알 수 없는 오류가 발생했습니다.',
          },
        },
      });
    }
  );
}; 