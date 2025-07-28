"use client";

import { useState } from "react";
import { Box, Button, Icon } from "@chakra-ui/react";
import { LuMessageCircle } from "react-icons/lu";

interface ChatWindowProps {
  threadId?: number;
}

export const ChatWindow = ({ threadId = 1 }: ChatWindowProps) => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  const openChatWindow = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width - width - 20;
    const top = window.screen.height - height - 100;

    window.open(
      `/chat-popup?threadId=${threadId}`,
      `chatWindow_${threadId}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,menubar=no`
    );
  };

  return (
    <Box position="fixed" bottom="4" right="4" zIndex="overlay">
      <Button
        onClick={openChatWindow}
        size="lg"
        colorScheme="blue"
        rounded="full"
        width="50px"
        height="50px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        shadow="lg"
        _hover={{ transform: "scale(1.05)" }}
        transition="all 0.2s"
      >
        <Icon as={LuMessageCircle} boxSize="24px" />
      </Button>
    </Box>
  );
};

export default ChatWindow;
