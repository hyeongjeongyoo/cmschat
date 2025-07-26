"use client";

import { Box, Grid, GridItem, Flex } from "@chakra-ui/react";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { Conversation } from "@/components/chat/Conversation";

const ChatManagementPage = () => {
  return (
    <Flex h="100vh" p={4}>
      <Grid
        h="full"
        w="full"
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        gap={4}
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
      >
        <GridItem overflowY="auto">
          <ChatRoomList />
        </GridItem>
        <GridItem borderLeftWidth="1px" d="flex" flexDir="column">
          <Conversation />
        </GridItem>
      </Grid>
    </Flex>
  );
};

export default ChatManagementPage;
