package cms.chat.controller;

import cms.chat.dto.ChatChannelDto;
import cms.chat.dto.ChatThreadDto;
import cms.chat.dto.ChatMessageDto;
import cms.chat.dto.SendMessageRequest;
import cms.chat.domain.ChatThread;
import cms.chat.service.ChatService;
import cms.common.dto.ApiResponseSchema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Tag(name = "Chat API", description = "채팅 관련 API")
@Slf4j
public class ChatController {

        private final ChatService chatService;

        @Operation(summary = "채널 목록 조회", description = "모든 CMS 채널 목록을 조회합니다.")
        @GetMapping("/channels")
        public ResponseEntity<ApiResponseSchema<List<ChatChannelDto>>> getChannels() {
                log.info("채널 목록 조회 요청");
                List<ChatChannelDto> channels = chatService.getAllChannelsWithUnreadCount();
                return ResponseEntity.ok(
                                ApiResponseSchema.success(channels, "채널 목록을 성공적으로 조회했습니다."));
        }

        @Operation(summary = "특정 채널의 채팅방 목록 조회", description = "특정 채널에 속한 채팅방 목록을 조회합니다.")
        @GetMapping("/channels/{channelId}/threads")
        public ResponseEntity<ApiResponseSchema<List<ChatThreadDto>>> getThreadsByChannel(
                        @Parameter(description = "채널 ID") @PathVariable Long channelId) {
                log.info("채널 {}의 채팅방 목록 조회 요청", channelId);
                List<ChatThreadDto> threads = chatService.getThreadsByChannel(channelId);
                return ResponseEntity.ok(
                                ApiResponseSchema.success(threads, "채팅방 목록을 성공적으로 조회했습니다."));
        }

        @Operation(summary = "전체 채팅방 목록 조회", description = "모든 채팅방 목록을 조회합니다.")
        @GetMapping("/threads")
        public ResponseEntity<ApiResponseSchema<List<ChatThreadDto>>> getAllThreads() {
                log.info("전체 채팅방 목록 조회 요청");
                List<ChatThreadDto> threads = chatService.getAllThreads();
                return ResponseEntity.ok(
                                ApiResponseSchema.success(threads, "채팅방 목록을 성공적으로 조회했습니다."));
        }

        @Operation(summary = "채팅방 메시지 목록 조회", description = "특정 채팅방의 메시지 목록을 조회합니다.")
        @GetMapping("/threads/{threadId}/messages")
        public ResponseEntity<ApiResponseSchema<List<ChatMessageDto>>> getMessages(
                        @Parameter(description = "채팅방 ID") @PathVariable Long threadId) {
                log.info("채팅방 {}의 메시지 목록 조회 요청", threadId);
                List<ChatMessageDto> messages = chatService.getMessages(threadId);
                return ResponseEntity.ok(
                                ApiResponseSchema.success(messages, "메시지 목록을 성공적으로 조회했습니다."));
        }

        @Operation(summary = "메시지 전송", description = "새로운 메시지를 전송합니다.")
        @PostMapping("/messages")
        public ResponseEntity<ApiResponseSchema<ChatMessageDto>> sendMessage(
                        @RequestBody SendMessageRequest request) {
                log.info("메시지 전송 요청: threadId={}, content={}", request.getThreadId(), request.getContent());

                ChatMessageDto savedMessage = chatService.saveMessage(
                                request.getThreadId(),
                                request.getSenderType() != null ? request.getSenderType() : "ADMIN",
                                request.getMessageType() != null ? request.getMessageType() : "TEXT",
                                request.getContent(),
                                request.getSenderName() != null ? request.getSenderName() : "관리자",
                                "127.0.0.1" // 실제 IP 주소로 대체 필요
                );

                return ResponseEntity.ok(
                                ApiResponseSchema.success(savedMessage, "메시지가 성공적으로 전송되었습니다."));
        }

        @Operation(summary = "메시지 읽음 처리", description = "특정 메시지를 읽음 처리합니다.")
        @PutMapping("/threads/{threadId}/messages/{messageId}/read")
        public ResponseEntity<ApiResponseSchema<Void>> markAsRead(
                        @Parameter(description = "채팅방 ID") @PathVariable Long threadId,
                        @Parameter(description = "메시지 ID") @PathVariable Long messageId) {
                log.info("메시지 읽음 처리 요청: threadId={}, messageId={}", threadId, messageId);

                chatService.markAsRead(threadId, messageId);

                return ResponseEntity.ok(
                                ApiResponseSchema.success(null, "메시지가 성공적으로 읽음 처리되었습니다."));
        }

        @Operation(summary = "채팅방 생성 또는 조회", description = "특정 사용자와의 채팅방을 생성하거나 기존 채팅방을 조회합니다.")
        @PostMapping("/threads")
        public ResponseEntity<ApiResponseSchema<ChatThreadDto>> getOrCreateThread(
                        @RequestParam String cmsCode,
                        @RequestParam String userIdentifier,
                        @RequestParam String userName,
                        @RequestParam String userIp) {
                log.info("채팅방 생성/조회 요청: cmsCode={}, userIdentifier={}", cmsCode, userIdentifier);

                ChatThread thread = chatService.getOrCreateThread(cmsCode, userIdentifier, userName, userIp);
                ChatThreadDto threadDto = convertToThreadDto(thread);

                return ResponseEntity.ok(
                                ApiResponseSchema.success(threadDto, "채팅방을 성공적으로 생성/조회했습니다."));
        }

        // ChatThread를 ChatThreadDto로 변환하는 헬퍼 메서드
        private ChatThreadDto convertToThreadDto(ChatThread thread) {
                // ChatThreadDto 필드 순서: id, channelId, userIdentifier, userName, lastMessage,
                // lastMessageTimestamp, unreadCount
                return new ChatThreadDto(
                                thread.getId(), // id
                                thread.getChannel().getId(), // channelId
                                thread.getUserIdentifier(), // userIdentifier
                                thread.getUserName(), // userName
                                null, // lastMessage - 필요시 구현
                                null, // lastMessageTimestamp - 필요시 구현
                                0L // unreadCount - 필요시 구현
                );
        }
}