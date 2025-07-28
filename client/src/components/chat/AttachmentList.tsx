"use client";

import { Box, Flex, Text, Icon, Link, Button } from "@chakra-ui/react";
import { LuFile, LuDownload, LuImage } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/client";

interface AttachmentListProps {
  selectedThreadId: number | null;
}

interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

const fetchAttachments = async (
  threadId: number | null
): Promise<Attachment[]> => {
  if (!threadId) return [];
  const { data } = await publicApi.get(`/chat/threads/${threadId}/attachments`);
  return data;
};

export const AttachmentList = ({ selectedThreadId }: AttachmentListProps) => {
  const {
    data: attachments,
    isLoading,
    error,
  } = useQuery<Attachment[], Error>({
    queryKey: ["attachments", selectedThreadId],
    queryFn: () => fetchAttachments(selectedThreadId),
    enabled: !!selectedThreadId,
  });

  if (!selectedThreadId) {
    return (
      <Flex justify="center" align="center" h="full">
        <Text>채팅방을 선택해주세요.</Text>
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="full">
        <Text>파일 목록을 불러오는 중...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text>파일 목록을 불러오는데 실패했습니다.</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {attachments?.length === 0 ? (
        <Flex justify="center" align="center" h="200px">
          <Text color="gray.500">첨부된 파일이 없습니다.</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap={2}>
          {attachments?.map((file) => (
            <Flex
              key={file.id}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              align="center"
              justify="space-between"
              _hover={{ bg: "gray.50" }}
            >
              <Flex align="center" flex={1}>
                <Icon
                  as={file.fileType.startsWith("image/") ? LuImage : LuFile}
                  boxSize={5}
                  mr={3}
                />
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    {file.fileName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(file.createdAt).toLocaleString()}
                  </Text>
                </Box>
              </Flex>
              <Link href={file.fileUrl} download>
                <Button size="sm" variant="ghost">
                  <Icon as={LuDownload} mr={2} />
                  다운로드
                </Button>
              </Link>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
};
