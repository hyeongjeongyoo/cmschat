-- ============================================================================
-- 채팅 시스템 테이블 생성
-- 버전: V20
-- 작성일: 2025-01-28
-- 설명: CMS 통합 채팅 시스템을 위한 테이블 구조
-- ============================================================================

-- 1. 채팅 채널 테이블 (CMS별 채널 관리)
CREATE TABLE chat_channel (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT 'PK: 채널 ID',
    cms_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'CMS 고유 코드',
    cms_name VARCHAR(100) NOT NULL COMMENT 'CMS 표시명',
    description TEXT NULL COMMENT '채널 설명',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성 상태 (1=활성, 0=비활성)',
    max_concurrent_users INT DEFAULT 1000 COMMENT '최대 동시 접속자 수',
    business_hours JSON NULL COMMENT '운영 시간 설정 (JSON)',
    auto_response_message TEXT NULL COMMENT '자동 응답 메시지',
    created_by VARCHAR(36) NOT NULL COMMENT '생성자 ID',
    created_ip VARCHAR(45) NOT NULL COMMENT '생성자 IP',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    updated_by VARCHAR(36) NOT NULL COMMENT '수정자 ID',
    updated_ip VARCHAR(45) NOT NULL COMMENT '수정자 IP',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
    INDEX idx_cms_code (cms_code),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '채팅 채널 (CMS별)';

-- 2. 채팅방 테이블 (사용자별 채팅방)
CREATE TABLE chat_thread (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT 'PK: 채팅방 ID',
    channel_id BIGINT UNSIGNED NOT NULL COMMENT 'FK: 채널 ID',
    user_identifier VARCHAR(100) NOT NULL COMMENT '사용자 식별자 (사용자 ID, 세션 ID 등)',
    user_name VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    user_email VARCHAR(100) NULL COMMENT '사용자 이메일',
    user_phone VARCHAR(20) NULL COMMENT '사용자 전화번호',
    user_ip VARCHAR(45) NULL COMMENT '사용자 IP 주소',
    user_agent TEXT NULL COMMENT '사용자 브라우저 정보',
    status ENUM(
        'ACTIVE',
        'CLOSED',
        'ARCHIVED'
    ) NOT NULL DEFAULT 'ACTIVE' COMMENT '채팅방 상태',
    priority ENUM(
        'LOW',
        'NORMAL',
        'HIGH',
        'URGENT'
    ) NOT NULL DEFAULT 'NORMAL' COMMENT '우선순위',
    assigned_agent_id VARCHAR(36) NULL COMMENT '배정된 상담원 ID',
    first_message_at TIMESTAMP NULL COMMENT '첫 메시지 시각',
    last_message_at TIMESTAMP NULL COMMENT '마지막 메시지 시각',
    closed_at TIMESTAMP NULL COMMENT '채팅방 종료 시각',
    closed_by VARCHAR(36) NULL COMMENT '채팅방 종료자 ID',
    created_by VARCHAR(36) NOT NULL COMMENT '생성자 ID',
    created_ip VARCHAR(45) NOT NULL COMMENT '생성자 IP',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    updated_by VARCHAR(36) NOT NULL COMMENT '수정자 ID',
    updated_ip VARCHAR(45) NOT NULL COMMENT '수정자 IP',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
    FOREIGN KEY (channel_id) REFERENCES chat_channel (id) ON DELETE CASCADE,
    UNIQUE KEY uk_channel_user (channel_id, user_identifier),
    INDEX idx_channel_id (channel_id),
    INDEX idx_user_identifier (user_identifier),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned_agent (assigned_agent_id),
    INDEX idx_last_message_at (last_message_at),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '채팅방 (사용자별)';

-- 3. 채팅 메시지 테이블
CREATE TABLE chat_message (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT 'PK: 메시지 ID',
    thread_id BIGINT UNSIGNED NOT NULL COMMENT 'FK: 채팅방 ID',
    parent_message_id BIGINT UNSIGNED NULL COMMENT 'FK: 부모 메시지 ID (답글용)',
    content TEXT NOT NULL COMMENT '메시지 내용',
    sender_type ENUM(
        'USER',
        'AGENT',
        'SYSTEM',
        'BOT'
    ) NOT NULL COMMENT '발신자 유형',
    sender_name VARCHAR(100) NOT NULL COMMENT '발신자 이름',
    sender_id VARCHAR(36) NULL COMMENT '발신자 ID (시스템 사용자인 경우)',
    message_type ENUM(
        'TEXT',
        'IMAGE',
        'FILE',
        'AUDIO',
        'VIDEO',
        'SYSTEM',
        'EMOJI'
    ) NOT NULL DEFAULT 'TEXT' COMMENT '메시지 유형',
    file_name VARCHAR(255) NULL COMMENT '첨부파일명',
    file_url VARCHAR(500) NULL COMMENT '첨부파일 URL',
    file_size BIGINT NULL COMMENT '첨부파일 크기 (bytes)',
    file_mime_type VARCHAR(100) NULL COMMENT '첨부파일 MIME 타입',
    is_read TINYINT(1) NOT NULL DEFAULT 0 COMMENT '읽음 여부 (0=미읽음, 1=읽음)',
    read_at TIMESTAMP NULL COMMENT '읽음 시각',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '삭제 여부 (0=정상, 1=삭제)',
    deleted_at TIMESTAMP NULL COMMENT '삭제 시각',
    deleted_by VARCHAR(36) NULL COMMENT '삭제자 ID',
    metadata JSON NULL COMMENT '추가 메타데이터 (JSON)',
    created_by VARCHAR(36) NOT NULL COMMENT '생성자 ID',
    created_ip VARCHAR(45) NOT NULL COMMENT '생성자 IP',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    updated_by VARCHAR(36) NOT NULL COMMENT '수정자 ID',
    updated_ip VARCHAR(45) NOT NULL COMMENT '수정자 IP',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
    FOREIGN KEY (thread_id) REFERENCES chat_thread (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES chat_message (id) ON DELETE SET NULL,
    INDEX idx_thread_id (thread_id),
    INDEX idx_sender_type (sender_type),
    INDEX idx_message_type (message_type),
    INDEX idx_is_read (is_read),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_created_at (created_at),
    INDEX idx_thread_created (thread_id, created_at),
    INDEX idx_unread_messages (
        thread_id,
        is_read,
        created_at
    )
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '채팅 메시지';

-- 4. 채팅 참여자 테이블 (다중 상담원 지원용)
CREATE TABLE chat_participant (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT 'PK: 참여자 ID',
    thread_id BIGINT UNSIGNED NOT NULL COMMENT 'FK: 채팅방 ID',
    user_id VARCHAR(36) NOT NULL COMMENT '참여자 사용자 ID',
    user_name VARCHAR(100) NOT NULL COMMENT '참여자 이름',
    user_type ENUM(
        'AGENT',
        'SUPERVISOR',
        'OBSERVER'
    ) NOT NULL COMMENT '참여자 유형',
    status ENUM('ACTIVE', 'INACTIVE', 'LEFT') NOT NULL DEFAULT 'ACTIVE' COMMENT '참여 상태',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '참여 시각',
    left_at TIMESTAMP NULL COMMENT '퇴장 시각',
    last_read_message_id BIGINT UNSIGNED NULL COMMENT '마지막 읽은 메시지 ID',
    created_by VARCHAR(36) NOT NULL COMMENT '생성자 ID',
    created_ip VARCHAR(45) NOT NULL COMMENT '생성자 IP',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    updated_by VARCHAR(36) NOT NULL COMMENT '수정자 ID',
    updated_ip VARCHAR(45) NOT NULL COMMENT '수정자 IP',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
    FOREIGN KEY (thread_id) REFERENCES chat_thread (id) ON DELETE CASCADE,
    FOREIGN KEY (last_read_message_id) REFERENCES chat_message (id) ON DELETE SET NULL,
    UNIQUE KEY uk_thread_user (thread_id, user_id),
    INDEX idx_thread_id (thread_id),
    INDEX idx_user_id (user_id),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '채팅 참여자';

-- 5. 채팅 세션 로그 테이블 (접속 이력 관리)
CREATE TABLE chat_session_log (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT 'PK: 세션 로그 ID',
    thread_id BIGINT UNSIGNED NOT NULL COMMENT 'FK: 채팅방 ID',
    session_id VARCHAR(100) NOT NULL COMMENT '세션 ID',
    user_identifier VARCHAR(100) NOT NULL COMMENT '사용자 식별자',
    action ENUM(
        'CONNECT',
        'DISCONNECT',
        'MESSAGE_SENT',
        'MESSAGE_READ',
        'TYPING_START',
        'TYPING_STOP'
    ) NOT NULL COMMENT '액션 유형',
    user_agent TEXT NULL COMMENT '사용자 브라우저 정보',
    ip_address VARCHAR(45) NOT NULL COMMENT 'IP 주소',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    FOREIGN KEY (thread_id) REFERENCES chat_thread (id) ON DELETE CASCADE,
    INDEX idx_thread_id (thread_id),
    INDEX idx_session_id (session_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '채팅 세션 로그';

-- 6. 채팅 설정 테이블 (시스템 설정)
CREATE TABLE chat_setting (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT 'PK: 설정 ID',
    channel_id BIGINT UNSIGNED NULL COMMENT 'FK: 채널 ID (NULL이면 전역 설정)',
    setting_key VARCHAR(100) NOT NULL COMMENT '설정 키',
    setting_value TEXT NOT NULL COMMENT '설정 값',
    setting_type ENUM(
        'STRING',
        'NUMBER',
        'BOOLEAN',
        'JSON'
    ) NOT NULL DEFAULT 'STRING' COMMENT '설정 값 타입',
    description VARCHAR(200) NULL COMMENT '설정 설명',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성 상태',
    created_by VARCHAR(36) NOT NULL COMMENT '생성자 ID',
    created_ip VARCHAR(45) NOT NULL COMMENT '생성자 IP',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    updated_by VARCHAR(36) NOT NULL COMMENT '수정자 ID',
    updated_ip VARCHAR(45) NOT NULL COMMENT '수정자 IP',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
    FOREIGN KEY (channel_id) REFERENCES chat_channel (id) ON DELETE CASCADE,
    UNIQUE KEY uk_channel_key (channel_id, setting_key),
    INDEX idx_channel_id (channel_id),
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_active (is_active)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '채팅 설정';

-- 초기 데이터 삽입
INSERT INTO
    chat_channel (
        cms_code,
        cms_name,
        description,
        created_by,
        created_ip,
        updated_by,
        updated_ip
    )
VALUES (
        'DEFAULT',
        '기본 채널',
        '기본 CMS 채팅 채널',
        'SYSTEM',
        '127.0.0.1',
        'SYSTEM',
        '127.0.0.1'
    ),
    (
        'MAIN_SITE',
        '메인 사이트',
        '메인 웹사이트 채팅 채널',
        'SYSTEM',
        '127.0.0.1',
        'SYSTEM',
        '127.0.0.1'
    ),
    (
        'MOBILE_APP',
        '모바일 앱',
        '모바일 애플리케이션 채팅 채널',
        'SYSTEM',
        '127.0.0.1',
        'SYSTEM',
        '127.0.0.1'
    );

-- 기본 설정 삽입
INSERT INTO
    chat_setting (
        channel_id,
        setting_key,
        setting_value,
        setting_type,
        description,
        created_by,
        created_ip,
        updated_by,
        updated_ip
    )
VALUES (
        NULL,
        'MAX_MESSAGE_LENGTH',
        '1000',
        'NUMBER',
        '최대 메시지 길이',
        'SYSTEM',
        '127.0.0.1',
        'SYSTEM',
        '127.0.0.1'
    ),
    (
        NULL,
        'FILE_UPLOAD_MAX_SIZE',
        '10485760',
        'NUMBER',
        '파일 업로드 최대 크기 (10MB)',
        'SYSTEM',
        '127.0.0.1',
        'SYSTEM',
        '127.0.0.1'
    ),
    (
        NULL,
        'ALLOWED_FILE_TYPES',
        '["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"]',
        'JSON',
        '허용 파일 타입',
        'SYSTEM',
        '127.0.0.1',
        'SYSTEM',
        '127.0.0.1'
    ),
    (
        NULL,
        'AUTO_CLOSE_INACTIVE_HOURS',
        '24',
        'NUMBER',
        '비활성 채팅방 자동 종료 시간 (시간)',
        'SYSTEM',
        '127.0.0.1',
        'SYSTEM',
        '127.0.0.1'
    ),
    (
        NULL,
        'TYPING_INDICATOR_TIMEOUT',
        '3',
        'NUMBER',
        '타이핑 표시 타임아웃 (초)',
        'SYSTEM',
        '127.0.0.1',
        'SYSTEM',
        '127.0.0.1'
    );