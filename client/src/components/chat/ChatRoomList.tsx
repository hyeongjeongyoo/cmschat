"use client";

import {
  Avatar as ChakraAvatar,
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Image,
} from "@chakra-ui/react";

const chatRooms = [
  {
    id: 1,
    name: "김철수",
    lastMessage: "안녕하세요, 문의드립니다.",
    timestamp: "오후 3:45",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    unreadCount: 2,
  },
  {
    id: 2,
    name: "이영희",
    lastMessage: "네, 확인 후 연락드리겠습니다.",
    timestamp: "오후 2:10",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    unreadCount: 0,
  },
  {
    id: 3,
    name: "박민준",
    lastMessage: "감사합니다.",
    timestamp: "오전 11:30",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    unreadCount: 0,
  },
];

export const ChatRoomList = () => {
  return (
    <Box>
      <Heading size="md" p={4} borderBottomWidth="1px">
        채팅 목록
      </Heading>
      <Flex direction="column" align="stretch">
        {chatRooms.map((room) => (
          <Flex
            key={room.id}
            p={4}
            borderBottomWidth="1px"
            alignItems="center"
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
          >
            <Box
              as="span"
              mr={4}
              borderRadius="full"
              boxSize="40px"
              overflow="hidden"
            >
              <Image
                src={room.avatarUrl}
                alt={room.name}
                boxSize="100%"
                objectFit="cover"
              />
            </Box>
            <Box flex="1">
              <Flex justify="space-between">
                <Text fontWeight="bold">{room.name}</Text>
                <Text fontSize="xs" color="gray.500">
                  {room.timestamp}
                </Text>
              </Flex>
              <Flex justify="space-between" alignItems="center">
                <Text
                  fontSize="sm"
                  color="gray.600"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {room.lastMessage}
                </Text>
                {room.unreadCount > 0 && (
                  <Box
                    bg="red.500"
                    color="white"
                    borderRadius="full"
                    fontSize="xs"
                    boxSize="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {room.unreadCount}
                  </Box>
                )}
              </Flex>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};
