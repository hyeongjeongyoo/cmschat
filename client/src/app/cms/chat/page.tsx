"use client";

import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { GridSection } from "@/components/ui/grid-section";
import ChannelList from "@/components/chat/ChannelList";
import ChatRoomList from "@/components/chat/ChatRoomList";
import ConversationContainer from "@/components/chat/ConversationContainer";

const ChatManagementPage = () => {
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(
    null
  );
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);

  const handleSelectChannel = (channelId: number) => {
    setSelectedChannelId(channelId);
    setSelectedThreadId(null); // 채널 변경 시 채팅방 선택은 초기화
  };

  const chatLayout = [
    {
      id: "channels",
      x: 0,
      y: 0,
      w: 3,
      h: 8,
      title: "CMS Channels",
      minW: 2,
      minH: 4,
    },
    {
      id: "chatrooms",
      x: 3,
      y: 0,
      w: 3,
      h: 8,
      title: "Customer Chats",
      minW: 2,
      minH: 4,
    },
    {
      id: "conversation",
      x: 6,
      y: 0,
      w: 6,
      h: 8,
      title: "Conversation",
      minW: 4,
      minH: 4,
    },
  ];

  const gridSections = {
    channels: (
      <ChannelList
        selectedChannelId={selectedChannelId}
        onSelectChannel={handleSelectChannel}
      />
    ),
    chatrooms: (
      <ChatRoomList
        selectedChannelId={selectedChannelId}
        selectedThreadId={selectedThreadId}
        onSelectThread={setSelectedThreadId}
      />
    ),
    conversation: <ConversationContainer selectedThreadId={selectedThreadId} />,
  };

  return (
    <Box minH="100vh" w="full" position="relative">
      <GridSection initialLayout={chatLayout}>
        {chatLayout.map(
          (item) => gridSections[item.id as keyof typeof gridSections]
        )}
      </GridSection>
    </Box>
  );
};

export default ChatManagementPage;
