"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Icon, Input, Button, Badge } from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";
import { useChatMessages } from "@/hooks/useChat";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatMessageDto } from "@/types/api/chat";
import { useQueryClient } from "@tanstack/react-query";

interface ConversationProps {
  selectedThreadId: number | null;
}

export const Conversation = ({ selectedThreadId }: ConversationProps) => {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const { messages, isLoading, error, sendMessage } = useChatMessages(
    selectedThreadId || undefined
  ) as {
    messages: ChatMessageDto[];
    isLoading: boolean;
    error: unknown;
    sendMessage: (message: ChatMessageDto) => void;
  };

  // WebSocket 연결
  const {
    connected,
    sendMessage: sendWebSocketMessage,
    connectionAttempts,
  } = useWebSocket({
    threadId: selectedThreadId || undefined,
    onMessageReceived: (message) => {
      console.log("WebSocket message received:", message);
      // 실시간으로 받은 메시지를 React Query 캐시에 추가
      queryClient.setQueryData<ChatMessageDto[]>(
        ['chat', 'messages', selectedThreadId],
        (old) => old ? [...old, message] : [message]
      );
    },
  });

  // 새 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedThreadId) return;

    const message: ChatMessageDto = {
      threadId: selectedThreadId,
      content: messageInput,
      senderType: "ADMIN",
      senderName: "상담원",
      messageType: "TEXT",
    };

    console.log("Sending message:", message);

    // WebSocket이 연결되어 있으면 WebSocket으로 전송
    if (connected) {
      const success = sendWebSocketMessage(message);
      if (success) {
        setMessageInput("");
      } else {
        console.warn("WebSocket 전송 실패, HTTP API로 대체 전송");
        // WebSocket 전송 실패 시 HTTP API로 대체
        try {
          await sendMessage(message);
          setMessageInput("");
        } catch (error) {
          console.error("메시지 전송 실패:", error);
        }
      }
    } else {
      // WebSocket이 연결되지 않은 경우 HTTP API 사용
      try {
        await sendMessage(message);
        setMessageInput("");
      } catch (error) {
        console.error("메시지 전송 실패:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Flex direction="column" height="100%" suppressHydrationWarning>
      {/* 연결 상태 표시 */}
      <Box p={2} borderBottomWidth="1px" bg="gray.50">
        <Badge colorScheme={connected ? "green" : "red"}>
          {connected ? "연결됨" : "연결 중..."}
        </Badge>
      </Box>

      {/* 메시지 목록 */}
      <Flex direction="column" flex="1" p={4} overflowY="auto" gap={4}>
        {isLoading ? (
          <Text textAlign="center">메시지를 불러오는 중...</Text>
        ) : error ? (
          <Text textAlign="center" color="red.500">
            메시지를 불러오는데 실패했습니다.
          </Text>
        ) : !messages?.length ? (
          <Text textAlign="center" color="gray.500">
            아직 메시지가 없습니다.
          </Text>
        ) : (
          messages.map((message) => (
            <Flex
              key={message.id}
              justify={
                message.senderType === "ADMIN" ? "flex-end" : "flex-start"
              }
            >
              <Box
                maxW="70%"
                bg={message.senderType === "ADMIN" ? "blue.500" : "gray.100"}
                color={message.senderType === "ADMIN" ? "white" : "black"}
                px={4}
                py={2}
                borderRadius="lg"
              >
                <Text
                  fontSize="xs"
                  color={
                    message.senderType === "ADMIN"
                      ? "whiteAlpha.700"
                      : "gray.500"
                  }
                >
                  {message.senderName}
                </Text>
                <Text>{message.content}</Text>
                <Text
                  fontSize="xs"
                  color={
                    message.senderType === "ADMIN"
                      ? "whiteAlpha.700"
                      : "gray.500"
                  }
                  mt={1}
                  suppressHydrationWarning
                >
                  {message.createdAt
                    ? new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </Box>
            </Flex>
          ))
        )}
        <div ref={messagesEndRef} />
      </Flex>

      {/* 메시지 입력 */}
      <Box p={4} borderTopWidth="1px">
        <Flex gap={2}>
          <Input
            placeholder="메시지를 입력하세요..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!connected}
          />
          <Button
            colorScheme="blue"
            px={6}
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !connected}
          >
            <Icon as={LuSend} />
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Conversation;
