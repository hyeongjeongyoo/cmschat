-- ============================================================================
-- 최소한의 채팅 테스트 데이터
-- 버전: V21
-- 설명: chat-popup 테스트를 위한 최소 데이터
-- ============================================================================

-- 1. 기본 채널 (이미 V20에서 생성되었을 수 있음, 중복 방지)
INSERT IGNORE INTO
    chat_channel (
        id,
        cms_code,
        cms_name,
        description,
        created_by,
        created_ip,
        updated_by,
        updated_ip
    )
VALUES (
        1,
        'DEFAULT',
        '기본 채널',
        '기본 채팅 채널',
        'SYSTEM',
        '127.0.0.1',
        'SYSTEM',
        '127.0.0.1'
    );

-- 2. threadId=1 채팅방
INSERT INTO
    chat_thread (
        id,
        channel_id,
        user_identifier,
        user_name,
        user_email,
        user_phone,
        user_ip,
        user_agent,
        status,
        priority,
        assigned_agent_id,
        first_message_at,
        last_message_at,
        closed_at,
        closed_by,
        created_by,
        created_ip,
        updated_by,
        updated_ip
    )
VALUES (
        1,
        1,
        'visitor001',
        '방문자',
        'visitor@test.com',
        NULL,
        '192.168.1.100',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'ACTIVE',
        'NORMAL',
        'agent001',
        '2025-01-28 10:00:00',
        '2025-01-28 10:05:00',
        NULL,
        NULL,
        'visitor001',
        '192.168.1.100',
        'visitor001',
        '192.168.1.100'
    )
ON DUPLICATE KEY UPDATE
    user_name = '방문자';

-- 3. threadId=1 테스트 메시지들
INSERT INTO
    chat_message (
        thread_id,
        content,
        sender_type,
        sender_name,
        sender_id,
        message_type,
        is_read,
        read_at,
        created_by,
        created_ip,
        updated_by,
        updated_ip
    )
VALUES (
        1,
        '안녕하세요! 문의드릴게 있어서 연락했습니다.',
        'USER',
        '방문자',
        NULL,
        'TEXT',
        1,
        '2025-01-28 10:01:00',
        'visitor001',
        '192.168.1.100',
        'visitor001',
        '192.168.1.100'
    ),
    (
        1,
        '안녕하세요! 무엇을 도와드릴까요?',
        'ADMIN',
        '상담원',
        'agent001',
        'TEXT',
        1,
        '2025-01-28 10:02:00',
        'agent001',
        '127.0.0.1',
        'agent001',
        '127.0.0.1'
    ),
    (
        1,
        '제품 구매 관련해서 질문이 있습니다.',
        'USER',
        '방문자',
        NULL,
        'TEXT',
        1,
        '2025-01-28 10:03:00',
        'visitor001',
        '192.168.1.100',
        'visitor001',
        '192.168.1.100'
    ),
    (
        1,
        '어떤 제품에 대해 문의하시나요?',
        'ADMIN',
        '상담원',
        'agent001',
        'TEXT',
        1,
        '2025-01-28 10:04:00',
        'agent001',
        '127.0.0.1',
        'agent001',
        '127.0.0.1'
    ),
    (
        1,
        '가격 정보를 알고 싶습니다.',
        'USER',
        '방문자',
        NULL,
        'TEXT',
        0,
        NULL,
        'visitor001',
        '192.168.1.100',
        'visitor001',
        '192.168.1.100'
    );