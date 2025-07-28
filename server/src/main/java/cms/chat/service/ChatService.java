package cms.chat.service;

import cms.chat.domain.ChatChannel;
import cms.chat.domain.ChatThread;
import cms.chat.domain.ChatMessage;
import cms.chat.dto.ChatChannelDto;
import cms.chat.dto.ChatThreadDto;
import cms.chat.dto.ChatMessageDto;
import cms.chat.repository.ChatChannelRepository;
import cms.chat.repository.ChatThreadRepository;
import cms.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
        private final ChatChannelRepository channelRepository;
        private final ChatThreadRepository threadRepository;
        private final ChatMessageRepository messageRepository;

        @Transactional(readOnly = true)
        public List<ChatChannelDto> getAllChannelsWithUnreadCount() {
                List<ChatChannel> channels = channelRepository.findAll();
                return channels.stream()
                                .map(channel -> {
                                        Long unreadCount = messageRepository
                                                        .countUnreadMessagesByChannelId(channel.getId());
                                        return new ChatChannelDto(
                                                        channel.getId(),
                                                        channel.getCmsCode(),
                                                        channel.getCmsName(),
                                                        unreadCount);
                                })
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ChatThreadDto> getAllThreads() {
                List<ChatThread> threads = threadRepository.findAll();
                return threads.stream()
                                .map(this::convertToThreadDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ChatThreadDto> getThreadsByChannel(Long channelId) {
                List<ChatThread> threads = threadRepository.findByChannelId(channelId);
                return threads.stream()
                                .map(this::convertToThreadDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ChatMessageDto> getMessages(Long threadId) {
                ChatThread thread = threadRepository.findById(threadId)
                                .orElseThrow(() -> new IllegalArgumentException("Thread not found"));

                List<ChatMessage> messages = messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
                return messages.stream()
                                .map(this::convertToMessageDto)
                                .collect(Collectors.toList());
        }

        @Transactional
        public ChatMessageDto saveMessage(Long threadId, String senderType, String messageType,
                        String content, String senderName, String createdIp) {
                ChatThread thread = threadRepository.findById(threadId)
                                .orElseThrow(() -> new IllegalArgumentException("Thread not found"));

                ChatMessage message = ChatMessage.builder()
                                .thread(thread)
                                .content(content)
                                .senderType(senderType)
                                .senderName(senderName)
                                .messageType(messageType)
                                .isRead(false)
                                .createdBy(senderName)
                                .createdIp(createdIp)
                                .updatedBy(senderName)
                                .updatedIp(createdIp)
                                .build();

                message = messageRepository.save(message);
                return convertToMessageDto(message);
        }

        @Transactional
        public void markAsRead(Long threadId, Long messageId) {
                ChatMessage message = messageRepository.findById(messageId)
                                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

                if (!message.getThread().getId().equals(threadId)) {
                        throw new IllegalArgumentException("Message does not belong to the specified thread");
                }

                message.setRead(true);
                message.setReadAt(LocalDateTime.now());
                messageRepository.save(message);
        }

        @Transactional
        public ChatThread getOrCreateThread(String cmsCode, String userIdentifier, String userName, String userIp) {
                ChatChannel channel = channelRepository.findByCmsCode(cmsCode)
                                .orElseThrow(() -> new IllegalArgumentException("Channel not found"));

                return threadRepository.findByChannelAndUserIdentifier(channel, userIdentifier)
                                .orElseGet(() -> {
                                        ChatThread newThread = ChatThread.builder()
                                                        .channel(channel)
                                                        .userIdentifier(userIdentifier)
                                                        .userName(userName)
                                                        .createdBy(userIdentifier)
                                                        .createdIp(userIp)
                                                        .updatedBy(userIdentifier)
                                                        .updatedIp(userIp)
                                                        .build();
                                        return threadRepository.save(newThread);
                                });
        }

        private ChatThreadDto convertToThreadDto(ChatThread thread) {
                ChatMessage lastMessage = messageRepository.findTopByThreadIdOrderByCreatedAtDesc(thread.getId())
                                .orElse(null);

                Long unreadCount = messageRepository.countUnreadMessagesByThreadId(thread.getId());

                return new ChatThreadDto(
                                thread.getId(),
                                thread.getChannel().getId(),
                                thread.getUserIdentifier(),
                                thread.getUserName(),
                                lastMessage != null ? lastMessage.getContent() : null,
                                lastMessage != null ? lastMessage.getCreatedAt().toString() : null,
                                unreadCount);
        }

        private ChatMessageDto convertToMessageDto(ChatMessage message) {
                return new ChatMessageDto(
                                message.getId(),
                                message.getThread().getId(),
                                message.getContent(),
                                message.getSenderType(),
                                message.getSenderName(),
                                message.getMessageType(),
                                message.getFileName(),
                                message.getFileUrl(),
                                message.isRead(),
                                message.getReadAt() != null ? message.getReadAt().toString() : null,
                                message.getCreatedAt() != null ? message.getCreatedAt().toString() : null);
        }
}