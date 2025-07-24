# 프론트엔드 개발 문서

## 1. 개요

본 문서는 '통합 CMS 채팅 시스템'의 프론트엔드 설계를 정의합니다. 프론트엔드는 CS Manager 어드민과 사용자 채팅창 두 부분으로 구성되며, Next.js를 기반으로 구축됩니다.

## 2. 기술 스택

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI Library**: Chakra UI
- **State Management**: React Query (Server State), Recoil (Client State)
- **Real-time**: STOMP.js, SockJS-Client
- **Form Handling**: React Hook Form
- **Code Style**: ESLint, Prettier

## 3. 프로젝트 구조 (제안)

```
/
├── public/                     # 정적 에셋 (이미지, 폰트)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/            # 관리자 전용 레이아웃 그룹
│   │   │   ├── dashboard/      # 대시보드 페이지
│   │   │   ├── chat/           # 채팅 관리 페이지
│   │   │   │   └── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   └── login/          # 로그인 페이지
│   │   └── (user)/             # 사용자 채팅창 전용 그룹
│   │       └── chat/           # 새 창으로 열릴 채팅 페이지
│   │           └── page.tsx
│   ├── components/
│   │   ├── common/             # 공통 컴포넌트 (Button, Modal 등)
│   │   ├── chat/               # 채팅 관련 컴포넌트 (MessageBubble, ChatInput)
│   │   └── dashboard/          # 대시보드 위젯 (KPI카드, 차트)
│   ├── hooks/                  # 커스텀 훅 (useSocket, useAuth)
│   ├── lib/                    # 라이브러리 및 외부 서비스 설정
│   │   ├── api.ts              # Axios 인스턴스 및 API 클라이언트
│   │   └── stomp.ts            # STOMP 클라이언트 설정
│   ├── store/                  # 전역 클라이언트 상태 (Zustand)
│   │   └── useAuthStore.ts     # 인증 관련 상태 (토큰, 관리자 정보)
│   └── types/                  # 전역 TypeScript 타입 정의
│       ├── api.ts
│       └── chat.ts
└── package.json
```

## 4. 상태 관리 전략

- **서버 상태 (Server State)**: `React Query`를 사용하여 API 데이터를 관리합니다.

  - 채팅 목록, 메시지 기록, 대시보드 데이터 등 모든 서버 데이터는 React Query를 통해 `캐싱`, `자동 리프레시`, `낙관적 업데이트` 등을 관리합니다.
  - `Query Keys`를 체계적으로 관리하여 캐시 무효화(invalidation)를 효율적으로 처리합니다. (예: `['threads', cmsCode]`)

- **클라이언트 상태 (Client State)**: `Recoil`을 사용하여 전역적으로 관리되어야 하는 UI 상태나 사용자 정보를 관리합니다.
  - `atom`을 사용하여 개별 상태(예: `adminAuthState`, `selectedThreadIdState`)를 정의합니다.
  - `selector`를 사용하여 파생된 상태를 관리하거나 비동기 로직을 처리할 수 있습니다.
  - 예: 관리자 로그인 상태, JWT 토큰, 선택된 채팅방 ID, 다크 모드 등

## 5. 핵심 기능 구현 가이드

### 5.1. 사용자 채팅창 (새 창)

- **진입점**: CMS 웹페이지의 버튼 클릭 시 `window.open('/chat?cmsCode=CMS01', ...)` 형태로 새 브라우저 창(팝업)을 엽니다.
- **사용자 식별**:
  - `LocalStorage`에서 기존 `userIdentifier`를 확인하여 사용자를 식별합니다.
  - 이 `userIdentifier`는 동일한 고객사 내에서 여러 사용자를 구분하는 역할을 합니다.
- **대화 시작/이어가기**: 사용자가 새 창을 열면, 프론트엔드는 백엔드에 `userIdentifier`를 보내 해당 사용자의 기존 `ChatThread` 정보를 요청합니다. 백엔드는 기존 대화가 있으면 그 정보를, 없으면 새로 생성하여 정보를 반환합니다. 이를 통해 사용자는 항상 자신의 유일한 대화창에 접근하게 됩니다.

### 5.2. CS Manager 어드민

- **레이아웃**: 최종 UI 시안에 맞춰 좌측(CMS 목록), 중앙(대화/첨부파일 목록), 우측(채팅 타임라인)의 3단 레이아웃으로 구현합니다.
  - **좌측 CMS 목록**: `GET /api/chat/channels` API를 호출하여 채널 목록과 각 채널의 안 읽은 메시지 총합을 가져와 표시합니다.
  - **중앙 대화 목록**: 특정 CMS 채널 클릭 시, `GET /api/chat/threads?cmsCode={...}` API를 호출하여 해당 채널의 모든 **사용자별 고유 대화 목록**을 가져옵니다. 목록에는 사용자 이름과 안 읽은 메시지 수가 표시됩니다.
  - **중앙 첨부파일 탭**: `GET /api/chat/files?cmsCode={...}` API를 호출하여 해당 채널의 모든 첨부파일을 가져와 표시합니다.
  - **우측 채팅 타임라인**: 중앙 목록에서 특정 대화를 선택하면, `GET /api/chat/messages?threadId={...}` API를 호출하여 상세 대화 내용을 가져옵니다.
  - Chakra UI의 `Grid` 또는 `Flex`를 활용하여 구현합니다.
- **대시보드**:
  - KPI 카드는 `useQuery`를 사용하여 `/api/dashboard/kpi` 데이터를 주기적으로(`refetchInterval`) 가져와 표시합니다.
  - 차트는 `recharts` 또는 `nivo`와 같은 라이브러리를 사용하여 시각화합니다.
- **실시간 메시지 처리**:
  1. **연결**: `useSocket`과 같은 커스텀 훅을 만들어 로그인 시 WebSocket에 연결하고, 로그아웃 시 연결을 해제합니다.
  2. **구독**:
     - 채팅방에 입장하면 `/sub/chat/{threadId}`를 구독합니다.
     - 로그인 직후, 실시간 카운트 업데이트를 위해 `/sub/counts/{adminId}`를 구독합니다.
  3. **수신**:
     - 메시지 수신(`ChatMessageDto`): `React Query`의 `queryClient.setQueryData`를 사용하여 해당 채팅방의 메시지 캐시를 업데이트하여 화면에 즉시 반영합니다.
     - 카운트 업데이트 수신(`{ channelId, threadId }`): `queryClient.invalidateQueries`를 사용하여 `['channels']`와 `['threads', channelId]` 쿼리를 무효화하여 최신 카운트를 다시 불러오게 합니다.
  4. **발신 (낙관적 업데이트)**:
     - `onMutate`: 메시지를 보내기 직전에 `queryClient`의 캐시를 직접 수정하여 보낸 메시지를 UI에 먼저 표시합니다.
     - `onError`: 메시지 전송 실패 시, 캐시를 이전 상태로 롤백하고 에러 UI를 표시합니다.
     - `onSuccess`: 메시지 전송 성공 시, 서버로부터 받은 최종 데이터로 캐시를 업데이트하거나, 캐시를 무효화하여 최신 데이터를 다시 가져옵니다.

### 5.3. 첨부파일 탭 (수정)

- **목표**: 관리자가 특정 CMS 채널 전체의 첨부파일을 한곳에서 모아보고 관리할 수 있도록 합니다.
- **구현**:
  - 관리자가 중앙 패널에서 **'첨부파일' 탭**을 선택하면, 프론트엔드는 `useQuery`를 사용하여 `GET /api/chat/files?cmsCode={선택된_CMS_코드}` API를 호출합니다.
  - 이 API는 해당 CMS 채널의 모든 채팅방에서 주고받은 파일 목록 전체를 반환합니다.
  - 받아온 파일 목록을 테이블 또는 그리드 형태로 화면에 렌더링합니다.
  - 각 파일 항목에는 다음 정보가 포함됩니다:
    - 미리보기 (이미지/영상은 썸네일, 문서는 아이콘)
    - 파일명
    - 파일을 보낸 사용자 이름 (`userName`)
    - 업로드 날짜
    - 다운로드 버튼
- **기존 로직과의 차이점**: 현재 대화창의 메시지 목록을 클라이언트에서 필터링하는 방식이 아닌, **첨부파일 조회를 위한 전용 API를 호출**하여 효율성을 높이고 CMS 전체의 파일을 볼 수 있도록 합니다.
