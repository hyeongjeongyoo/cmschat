# 백엔드 개발 문서

## 1. 개요

본 문서는 '통합 CMS 채팅 시스템'의 백엔드 시스템 설계를 정의합니다. 백엔드는 Spring(전자정부프레임워크) 기반으로 구축되며, REST API와 WebSocket(STOMP)을 통해 클라이언트와 통신합니다.

## 2. 기술 스택

- **Framework**: 전자정부프레임워크 (Spring 기반)
- **ORM**: JPA (Hibernate)
- **Database**: MariaDB
- **Real-time**: Spring WebSocket (with STOMP)
- **Authentication**: Spring Security + JWT
- **Build Tool**: Maven / Gradle

## 3. 시스템 아키텍처

- **N-Tier Architecture**
  - **Controller Layer**: REST API 및 WebSocket 엔드포인트를 정의하고, 클라이언트 요청을 받아 서비스 레이어에 전달합니다.
  - **Service Layer**: 핵심 비즈니스 로직(채팅 메시지 처리, 채널 생성, 권한 검사 등)을 수행합니다.
  - **Repository Layer**: JPA를 사용하여 데이터베이스와 상호작용합니다.
  - **Domain Layer**: `@Entity` 어노테이션이 붙은 데이터베이스 테이블과 매핑되는 객체들로 구성됩니다.

## 4. API 명세 (RESTful API)

### 4.1. 인증 API

| Method | URL                | 설명          | Request Body                               | Response       |
| ------ | ------------------ | ------------- | ------------------------------------------ | -------------- |
| `POST` | `/api/admin/login` | 관리자 로그인 | `{ "username": "...", "password": "..." }` | `200 OK` + JWT |

### 4.2. 채팅 API

| Method | URL                  | 설명                                                                                  | Query Params                              | Response               |
| ------ | -------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------- |
| `GET`  | `/api/chat/channels` | 관리자가 접근 가능한 CMS 채널 목록과 각 채널의 총 안읽은 메시지 수 조회               | -                                         | `List<ChatChannelDto>` |
| `GET`  | `/api/chat/threads`  | 특정 CMS 채널에 속한 모든 사용자 채팅방 목록 조회. 각 채팅방의 안읽은 메시지 수 포함. | `cmsCode` (필수)                          | `List<ChatThreadDto>`  |
| `GET`  | `/api/chat/messages` | 특정 채팅방의 메시지 목록 (과거 내역)                                                 | `threadId`, `page`, `size`                | `Page<ChatMessageDto>` |
| `POST` | `/api/chat/read`     | 메시지 읽음 처리 (Bulk)                                                               | `{ "threadId": 1, "messageIds": [1, 2] }` | `200 OK`               |
| `GET`  | `/api/chat/files`    | CMS 단위 또는 채팅방 단위 첨부파일 조회                                               | `cmsCode` or `threadId`                   | `List<ChatFileDto>`    |
| `POST` | `/api/files/upload`  | 파일 업로드 (기존 게시판 API 재사용)                                                  | `MultipartFile`                           | `FileInfo`             |

### 4.3. 대시보드 API

| Method | URL                     | 설명                                   | Response                                                                |
| ------ | ----------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| `GET`  | `/api/dashboard/kpi`    | 핵심 지표(KPI) 데이터 조회             | `{ "activeThreads": ..., "todayThreads": ..., "avgResponseTime": ... }` |
| `GET`  | `/api/dashboard/charts` | 차트 데이터 조회 (문의량, CMS 비중 등) | `{ "hourlyStats": [...], "cmsStats": [...] }`                           |

## 5. WebSocket 토픽 구조 (STOMP)

- **Endpoint**: `/ws` (WebSocket 연결을 위한 Handshake 엔드포인트)

### 5.1. 구독 (Subscribe)

클라이언트가 서버로부터 메시지를 수신하기 위해 구독하는 경로입니다.

- `/sub/chat/{threadId}`

  - **설명**: 특정 채팅방의 실시간 메시지를 수신합니다. 클라이언트는 채팅방에 입장할 때 이 토픽을 구독해야 합니다.
  - **Payload**: `ChatMessageDto`

- `/sub/counts/{adminId}`
  - **설명**: **(수정)** 담당 관리자에게 실시간 카운트 변경 정보를 전달합니다.
  - **Payload**: `{ "type": "UPDATE_COUNTS", "payload": { "channelId": 1, "threadId": 101 } }`

### 5.2. 발행 (Publish)

클라이언트가 서버로 데이터를 전송하기 위한 경로입니다.

- `/pub/chat/message`

  - **설명**: 사용자와 관리자가 메시지를 서버로 전송합니다.
  - **Payload**: `{ "threadId": 1, "senderType": "USER", "messageType": "TEXT", "content": "안녕하세요" }`

- `/pub/chat/read`
  - **설명**: 관리자가 메시지를 읽었음을 서버에 알립니다. 서버는 이 메시지를 받고 해당 메시지들을 `is_read = true`로 업데이트합니다.
  - **Payload**: `{ "threadId": 1, "lastReadMessageId": 123 }`

## 6. 핵심 로직 구현 가이드

### 6.1. 인증 및 권한 (Spring Security)

- **인증**: 관리자 계정은 사전에 DB에 직접 추가하며, 로그인은 Spring Security와 JWT를 통해 처리합니다.
- **권한**: 현재 시스템은 모든 관리자가 모든 채널에 접근 가능한 단일 권한(`ROLE_ADMIN`) 모델을 따릅니다. 향후 관리자별 채널 접근 제어가 필요할 경우, 별도의 권한 관리 테이블 설계가 필요합니다.

### 6.2. 자동 채널 생성

- `/pub/chat/message` 요청 수신 시, 해당 `cmsCode`를 가진 `ChatChannel`이 없는 경우 새로운 채널을 자동으로 생성하는 로직을 서비스 레이어에 추가합니다.

### 6.3. 채팅방 생성 및 조회 로직

- 사용자가 채팅을 시작할 때(첫 메시지 전송 등), 백엔드는 `channel_id`와 `user_identifier`를 기준으로 `chat_thread` 테이블을 먼저 조회합니다.
- **기존 채팅방이 있으면**: 해당 `threadId`를 반환하여 대화를 이어가게 합니다.
- **기존 채팅방이 없으면**: 새로운 `ChatThread`를 생성하고 그 `threadId`를 반환합니다.
- 이 로직을 통해 "한 사용자당 채널별로 하나의 대화" 규칙이 애플리케이션 레벨에서도 보장됩니다.

### 6.4. 생성/수정 이력 자동 기록 (JPA Auditing)

- 모든 주요 엔티티(`ChatChannel`, `ChatThread`, `ChatMessage`)에 대해 생성/수정자 정보가 자동으로 기록되도록 JPA Auditing 기능을 활성화합니다.
- 공통 필드(`createdBy`, `createdAt`, `updatedBy`, `updatedAt` 등)를 가진 `BaseEntity`를 만들고, 모든 엔티티가 이를 상속받도록 설계합니다.
- `@CreatedBy`, `@LastModifiedBy` 어노테이션을 사용하여 현재 로그인된 사용자의 정보를 자동으로 주입합니다.

### 6.5. 대시보드 데이터 집계

- `평균 첫 응답 시간`, `시간대별 문의량` 등은 매일 새벽 스케줄링 잡(`@Scheduled`)을 통해 미리 계산하여 통계 테이블에 저장해두면 조회 성능을 향상시킬 수 있습니다.
- `Disk 사용량`은 `java.io.File` 클래스를 사용하거나, 서버 모니터링 에이전트(Prometheus 등)와 연동하여 가져올 수 있습니다.

### 6.6. 실시간 읽음/안읽음 카운트 처리

- **목표**: 새 메시지 수신 또는 기존 메시지 읽음 처리 시, 관련된 모든 관리자의 UI 카운트를 실시간으로 동기화합니다.
- **프로세스**:
  1. **새 메시지 수신 시**:
     - 백엔드는 `/pub/chat/message`를 통해 새 메시지를 받으면, 해당 메시지를 DB에 저장합니다.
     - 저장 후, 해당 `threadId`와 연관된 `channelId`를 찾습니다.
     - `/sub/chat/{threadId}`로 새 메시지를 브로드캐스팅합니다.
     - 동시에, **온라인 상태인 모든 관리자**에게 `/sub/counts/{adminId}` 토픽으로 카운트 변경 정보를 푸시합니다.
  2. **메시지 읽음 처리 시**:
     - `POST /api/chat/read` 또는 `/pub/chat/read` 요청을 처리한 후, 변경된 카운트 정보를 위와 동일한 방식으로 모든 온라인 관리자에게 푸시합니다.
