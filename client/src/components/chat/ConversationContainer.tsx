"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { Conversation } from "./Conversation";
import { AttachmentList } from "./AttachmentList";

interface ConversationContainerProps {
  selectedThreadId: number | null;
}

export const ConversationContainer = ({
  selectedThreadId,
}: ConversationContainerProps) => {
  const [activeTab, setActiveTab] = useState<"chat" | "attachments">("chat");

  return (
    <Box h="full" display="flex" flexDirection="column">
      <Flex borderBottomWidth="1px" px={4}>
        <Box
          px={4}
          py={2}
          cursor="pointer"
          borderBottomWidth="2px"
          borderBottomColor={activeTab === "chat" ? "blue.500" : "transparent"}
          color={activeTab === "chat" ? "blue.500" : "gray.600"}
          onClick={() => setActiveTab("chat")}
        >
          대화
        </Box>
        <Box
          px={4}
          py={2}
          cursor="pointer"
          borderBottomWidth="2px"
          borderBottomColor={
            activeTab === "attachments" ? "blue.500" : "transparent"
          }
          color={activeTab === "attachments" ? "blue.500" : "gray.600"}
          onClick={() => setActiveTab("attachments")}
        >
          첨부파일
        </Box>
      </Flex>
      <Box flex="1" overflow="hidden">
        {activeTab === "chat" ? (
          <Conversation selectedThreadId={selectedThreadId} />
        ) : (
          <AttachmentList selectedThreadId={selectedThreadId} />
        )}
      </Box>
    </Box>
  );
};

export default ConversationContainer;
