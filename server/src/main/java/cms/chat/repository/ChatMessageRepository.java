package cms.chat.repository;

import cms.chat.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByThreadIdOrderByCreatedAtAsc(Long threadId);

    Optional<ChatMessage> findTopByThreadIdOrderByCreatedAtDesc(Long threadId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.thread.id = :threadId AND m.isRead = false")
    long countUnreadMessagesByThreadId(@Param("threadId") Long threadId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.thread.channel.id = :channelId AND m.isRead = false")
    long countUnreadMessagesByChannelId(@Param("channelId") Long channelId);
}