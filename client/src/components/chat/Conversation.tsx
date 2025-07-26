"use client";

import {
  Box,
  Flex,
  Heading,
  Input,
  Button, // IconButton -> Button
  Text,
  Image,
} from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";

const messages = [
  {
    id: 1,
    sender: "김철수",
    text: "안녕하세요, 문의드립니다.",
    timestamp: "오후 3:45",
    isMe: false,
    avatarUrl: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    sender: "관리자",
    text: "네, 안녕하세요. 무엇을 도와드릴까요?",
    timestamp: "오후 3:46",
    isMe: true,
  },
  {
    id: 3,
    sender: "김철수",
    text: "제품 A의 재고가 있는지 궁금합니다.",
    timestamp: "오후 3:47",
    isMe: false,
    avatarUrl: "https://i.pravatar.cc/150?img=1",
  },
];

export const Conversation = () => {
  return (
    <Flex direction="column" h="full">
      <Heading size="md" p={4} borderBottomWidth="1px">
        김철수 님과의 대화
      </Heading>
      <Flex direction="column" flex="1" p={4} overflowY="auto">
        {messages.map((msg, index) => (
          <Flex
            key={msg.id}
            w="full"
            justify={msg.isMe ? "flex-end" : "flex-start"}
            align="flex-end"
            mb={index !== messages.length - 1 ? 4 : 0}
          >
            {!msg.isMe && (
              <Box
                as="span"
                mr={2}
                borderRadius="full"
                boxSize="32px"
                overflow="hidden"
              >
                <Image
                  src={msg.avatarUrl}
                  alt={msg.sender}
                  boxSize="100%"
                  objectFit="cover"
                />
              </Box>
            )}
            <Box
              bg={msg.isMe ? "blue.500" : "gray.100"}
              color={msg.isMe ? "white" : "black"}
              px={4}
              py={2}
              borderRadius="lg"
              maxW="70%"
            >
              <Text>{msg.text}</Text>
            </Box>
          </Flex>
        ))}
      </Flex>
      <Flex p={4} borderTopWidth="1px" align="center">
        <Input placeholder="메시지를 입력하세요..." />
        <Button
          aria-label="Send message"
          ml={2}
          colorScheme="blue"
          p={2} // Padding for the icon
        >
          <Box as="span">
            <LuSend />
          </Box>
        </Button>
      </Flex>
    </Flex>
  );
};
