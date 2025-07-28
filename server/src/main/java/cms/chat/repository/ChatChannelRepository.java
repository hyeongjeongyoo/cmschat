package cms.chat.repository;

import cms.chat.domain.ChatChannel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatChannelRepository extends JpaRepository<ChatChannel, Long> {
    Optional<ChatChannel> findByCmsCode(String cmsCode);
}