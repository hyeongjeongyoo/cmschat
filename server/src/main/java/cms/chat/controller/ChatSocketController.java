package cms.chat.controller;

import cms.chat.dto.ChatMessageDto;
import cms.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @MessageMapping("/chat/message")
    public void handleMessage(String messagePayload) {
        try {
            log.info("원본 메시지 payload: {}", messagePayload);

            // Base64 디코딩 시도
            String decodedMessage = messagePayload;
            try {
                // 따옴표 제거
                String cleanPayload = messagePayload.replaceAll("^\"|\"$", "");
                byte[] decodedBytes = Base64.getDecoder().decode(cleanPayload);
                decodedMessage = new String(decodedBytes, StandardCharsets.UTF_8);
                log.info("Base64 디코딩된 메시지: {}", decodedMessage);
            } catch (Exception e) {
                log.info("Base64 디코딩 실패, 원본 메시지 사용: {}", e.getMessage());
            }

            // JSON을 ChatMessageDto로 변환
            ChatMessageDto message = objectMapper.readValue(decodedMessage, ChatMessageDto.class);

            log.info("WebSocket 메시지 수신: threadId={}, content={}", message.getThreadId(), message.getContent());

            // 메시지를 데이터베이스에 저장
            ChatMessageDto savedMessage = chatService.saveMessage(
                    message.getThreadId(),
                    message.getSenderType() != null ? message.getSenderType() : "USER",
                    message.getMessageType() != null ? message.getMessageType() : "TEXT",
                    message.getContent(),
                    message.getSenderName() != null ? message.getSenderName() : "사용자",
                    "127.0.0.1" // 실제 IP 주소로 대체 필요
            );

            // 해당 채팅방을 구독하고 있는 클라이언트들에게 브로드캐스트
            messagingTemplate.convertAndSend("/sub/chat/" + message.getThreadId(), savedMessage);

            log.info("메시지 저장 및 브로드캐스트 완료: messageId={}", savedMessage.getId());

        } catch (Exception e) {
            log.error("WebSocket 메시지 처리 중 오류 발생", e);
        }
    }

    @MessageMapping("/chat/read")
    public void handleReadMessage(String messagePayload) {
        try {
            log.info("읽음 처리 원본 payload: {}", messagePayload);

            // Base64 디코딩 시도
            String decodedMessage = messagePayload;
            try {
                String cleanPayload = messagePayload.replaceAll("^\"|\"$", "");
                byte[] decodedBytes = Base64.getDecoder().decode(cleanPayload);
                decodedMessage = new String(decodedBytes, StandardCharsets.UTF_8);
                log.info("Base64 디코딩된 읽음 메시지: {}", decodedMessage);
            } catch (Exception e) {
                log.info("Base64 디코딩 실패, 원본 메시지 사용: {}", e.getMessage());
            }

            ChatMessageDto message = objectMapper.readValue(decodedMessage, ChatMessageDto.class);

            log.info("읽음 처리 요청: threadId={}, messageId={}", message.getThreadId(), message.getId());

            if (message.getId() != null) {
                chatService.markAsRead(message.getThreadId(), message.getId());

                // 읽음 상태 업데이트를 브로드캐스트
                messagingTemplate.convertAndSend("/sub/chat/" + message.getThreadId() + "/read", message);
            }

        } catch (Exception e) {
            log.error("읽음 처리 중 오류 발생", e);
        }
    }
}