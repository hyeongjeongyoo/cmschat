# 데이터베이스 설계 문서

## 1. 개요

본 문서는 '통합 CMS 채팅 시스템'의 데이터베이스 스키마, 관계, 그리고 각 테이블의 상세 컬럼을 정의합니다. 데이터 모델링은 시스템의 주요 기능인 채팅, 채널 관리, 파일 저장 등을 효율적으로 지원하는 데 목적을 둡니다.

## 2. ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    ChatChannel {
        bigint id PK "채널 ID"
        varchar(50) cms_code "CMS 코드 (Unique)"
        varchar(100) cms_name "CMS 이름"
        datetime created_at "생성일"
    }

    ChatThread {
        bigint id PK "채팅방 ID"
        bigint channel_id FK "채널 ID"
        varchar(255) user_identifier "사용자 식별자"
        varchar(100) user_name "사용자 이름"
        varchar(50) user_ip "사용자 IP"
        datetime created_at "생성일"
        Unique(channel_id, user_identifier) "사용자별 대화는 채널당 하나만"
    }

    ChatMessage {
        bigint id PK "메시지 ID"
        bigint thread_id FK "채팅방 ID"
        varchar(20) sender_type "발신자 타입 (USER/ADMIN)"
        varchar(20) message_type "메시지 타입 (TEXT/IMAGE/etc.)"
        text content "메시지 내용/파일 URL"
        varchar(255) file_name "원본 파일명"
        varchar(512) file_url "파일 접근/다운로드 경로"
        boolean is_read "읽음 여부"
        datetime read_at "읽은 시간"
        datetime created_at "생성일"
    }

    ChatChannel ||--o{ ChatThread : "has"
    ChatThread ||--o{ ChatMessage : "has"

```

- `ChatChannel`: 각 CMS(고객사)를 구분하는 최상위 채널입니다.
- `ChatThread`: 하나의 `ChatChannel` 내에서, **각기 다른 최종 사용자(고객사 직원 등)가 시작한 개별 대화(채팅방) 정보**를 관리합니다. `user_identifier`가 각 사용자를 구분하는 키가 됩니다.
- `ChatMessage`: 각 `ChatThread`(대화방)에서 오고 가는 메시지 단위입니다.

## 3. 테이블 명세

### 3.1. `chat_channel`

CMS 채널 정보를 저장하는 테이블입니다. 최초 채팅 발생 시 해당 `cms_code`가 없으면 자동으로 생성됩니다.

| 컬럼명       | 데이터 타입  | 제약조건           | 설명                                   |
| ------------ | ------------ | ------------------ | -------------------------------------- |
| `id`         | BIGINT       | PK, Auto-increment | 채널 고유 ID                           |
| `cms_code`   | VARCHAR(50)  | Not Null, Unique   | CMS를 식별하는 고유 코드 (예: "CMS01") |
| `cms_name`   | VARCHAR(100) |                    | CMS의 이름 (관리자 화면에 표시됨)      |
| `CREATED_BY` | VARCHAR(50)  |                    | 생성자 ID (adminId)                    |
| `CREATED_IP` | VARCHAR(45)  |                    | 생성자 IP                              |
| `CREATED_AT` | TIMESTAMP    | Not Null           | 생성 시각                              |
| `UPDATE_BY`  | VARCHAR(50)  |                    | 수정자 ID (adminId)                    |
| `UPDATE_IP`  | VARCHAR(45)  |                    | 수정자 IP                              |
| `UPDATE_AT`  | TIMESTAMP    | Not Null           | 수정 시각                              |

### 3.2. `chat_thread`

**하나의 고객사(채널) 내에서 발생하는 사용자별 1:1 채팅방 정보를 관리합니다.**

| 컬럼명            | 데이터 타입  | 제약조건           | 설명                                                         |
| ----------------- | ------------ | ------------------ | ------------------------------------------------------------ |
| `id`              | BIGINT       | PK, Auto-increment | 채팅방 고유 ID                                               |
| `channel_id`      | BIGINT       | Not Null, FK       | `chat_channel`의 ID를 참조                                   |
| `user_identifier` | VARCHAR(255) | Not Null           | 각 사용자를 식별하는 고유 값 (익명: UUID, 회원: CMS User ID) |
| `user_name`       | VARCHAR(100) |                    | 사용자 이름 (관리자 화면에 표시됨, 예: 'Customer A')         |
| `user_ip`         | VARCHAR(50)  |                    | 사용자 접속 IP 주소                                          |
| `CREATED_BY`      | VARCHAR(50)  |                    | 생성자 ID (userId or adminId)                                |
| `CREATED_IP`      | VARCHAR(45)  |                    | 생성자 IP                                                    |
| `CREATED_AT`      | TIMESTAMP    | Not Null           | 생성 시각                                                    |
| `UPDATE_BY`       | VARCHAR(50)  |                    | 수정자 ID (adminId)                                          |
| `UPDATE_IP`       | VARCHAR(45)  |                    | 수정자 IP                                                    |
| `UPDATE_AT`       | TIMESTAMP    | Not Null           | 수정 시각                                                    |

**제약조건 (Constraints)**

- `UNIQUE (channel_id, user_identifier)`: 한 명의 사용자는 특정 CMS 채널 내에서 오직 하나의 대화만 가질 수 있도록 보장합니다.

### 3.3. `chat_message`

채팅방 내에서 오고 간 모든 메시지(텍스트, 파일 등)를 저장합니다.

| 컬럼명         | 데이터 타입  | 제약조건                  | 설명                                           |
| -------------- | ------------ | ------------------------- | ---------------------------------------------- |
| `id`           | BIGINT       | PK, Auto-increment        | 메시지 고유 ID                                 |
| `thread_id`    | BIGINT       | Not Null, FK              | `chat_thread`의 ID를 참조                      |
| `sender_type`  | VARCHAR(20)  | Not Null                  | 발신자 타입 (`USER`, `ADMIN`)                  |
| `message_type` | VARCHAR(20)  | Not Null                  | 메시지 타입 (`TEXT`, `IMAGE`, `FILE`, `VIDEO`) |
| `content`      | TEXT         |                           | `TEXT` 타입일 경우 메시지 내용                 |
| `file_name`    | VARCHAR(255) |                           | `FILE` 타입일 경우 원본 파일명                 |
| `file_url`     | VARCHAR(512) |                           | `FILE` 타입일 경우 파일 접근/다운로드 경로     |
| `is_read`      | BOOLEAN      | Not Null, Default `false` | 관리자의 메시지 읽음 여부                      |
| `read_at`      | DATETIME     |                           | 관리자가 메시지를 읽은 시간                    |
| `CREATED_BY`   | VARCHAR(50)  |                           | 생성자 ID (userId or adminId)                  |
| `CREATED_IP`   | VARCHAR(45)  |                           | 생성자 IP                                      |
| `CREATED_AT`   | TIMESTAMP    | Not Null                  | 생성 시각                                      |
| `UPDATE_BY`    | VARCHAR(50)  |                           | 수정자 ID (adminId)                            |
| `UPDATE_IP`    | VARCHAR(45)  |                           | 수정자 IP                                      |
| `UPDATE_AT`    | TIMESTAMP    | Not Null                  | 수정 시각                                      |

// TODO 현재 구현되어 있는 데이터 베이스 확인 후 재설계

### 3.4. `chat_file` (선택적 분리 설계)

첨부파일의 메타 정보만 별도로 관리하여 검색 및 관리를 용이하게 할 수 있습니다.

| 컬럼명        | 데이터 타입  | 제약조건                | 설명                              |
| ------------- | ------------ | ----------------------- | --------------------------------- |
| `id`          | BIGINT       | PK, Auto-increment      | 파일 고유 ID                      |
| `message_id`  | BIGINT       | Not Null, FK            | `chat_message`의 ID 참조          |
| `thread_id`   | BIGINT       | Not Null                | 채팅방 ID (검색 최적화용)         |
| `cms_code`    | VARCHAR(50)  | Not Null                | CMS 코드 (검색 최적화용)          |
| `file_name`   | VARCHAR(255) |                         | 원본 파일명                       |
| `file_type`   | VARCHAR(50)  |                         | 파일 MIME 타입 (예: 'image/jpeg') |
| `file_size`   | BIGINT       |                         | 파일 크기 (bytes)                 |
| `file_url`    | VARCHAR(512) | Not Null                | 파일 접근/다운로드 경로           |
| `uploaded_at` | DATETIME     | Not Null, Default NOW() | 업로드 일시                       |
