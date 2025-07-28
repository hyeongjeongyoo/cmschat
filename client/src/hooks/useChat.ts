import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { chatApi } from '@/lib/api/chat';
import { ChatMessageDto, SendMessageRequest, ChatChannelDto, ChatThreadDto, ApiResponse } from '@/types/api/chat';

export const useChatChannels = () => {
  return useQuery<ChatChannelDto[], Error, ChatChannelDto[]>({
    queryKey: ['chat', 'channels'],
    queryFn: async () => {
      const response = await chatApi.getChannels();
      if (!response.data.success) {
        throw new Error(response.data.error || '채널 목록을 불러오는데 실패했습니다.');
      }
      return response.data.data;
    },
  });
};

export const useChatThreads = (channelId?: number) => {
  return useQuery<ChatThreadDto[], Error, ChatThreadDto[]>({
    queryKey: ['chat', 'threads', channelId],
    queryFn: async () => {
      const response = await chatApi.getThreads(channelId);
      if (!response.data.success) {
        throw new Error(response.data.error || '채팅방 목록을 불러오는데 실패했습니다.');
      }
      return response.data.data;
    },
    enabled: channelId !== undefined,
  });
};

export const useChatMessages = (threadId?: number) => {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery<ChatMessageDto[], Error, ChatMessageDto[]>({
    queryKey: ['chat', 'messages', threadId],
    queryFn: async () => {
      const response = await chatApi.getMessages(threadId!);
      if (!response.data.success) {
        throw new Error(response.data.error || '메시지를 불러오는데 실패했습니다.');
      }
      return response.data.data;
    },
    enabled: threadId !== undefined,
  });

  const sendMessageMutation = useMutation<
    ChatMessageDto,
    Error,
    SendMessageRequest
  >({
    mutationFn: async (data) => {
      const response = await chatApi.sendMessage(data);
      if (!response.data.success) {
        throw new Error(response.data.error || '메시지 전송에 실패했습니다.');
      }
      return response.data.data;
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<ChatMessageDto[]>(
        ['chat', 'messages', threadId],
        (old) => old ? [...old, newMessage] : [newMessage]
      );
    },
  });

  const markAsReadMutation = useMutation<
    void,
    Error,
    { messageId: number }
  >({
    mutationFn: async ({ messageId }) => {
      const response = await chatApi.markAsRead(threadId!, messageId);
      if (!response.data.success) {
        throw new Error(response.data.error || '읽음 처리에 실패했습니다.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat', 'threads'],
      });
    },
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    sendMessage: sendMessageMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
  };
}; 