"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { ChatWindow } from "@/components/chat/ChatWindow";

// 테스트용 CMS 목록
const testCmsList = [
  { id: 1, name: "온라인 쇼핑몰" },
  { id: 2, name: "교육 포털" },
  { id: 3, name: "블로그 서비스" },
];

export default function Home() {
  return (
    <Box p={4}>
      <Flex direction="column" gap={4} alignItems="flex-end">
        {testCmsList.map((cms) => (
          <Box key={cms.id} position="relative">
            <Text mb={2} fontSize="sm" color="gray.600">
              {cms.name}
            </Text>
            <ChatWindow threadId={cms.id} />
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
