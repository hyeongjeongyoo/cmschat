"use client";

import { Box } from "@chakra-ui/react";
import { Conversation } from "@/components/chat/Conversation";
import { useSearchParams } from "next/navigation";

export default function ChatPopupPage() {
  const searchParams = useSearchParams();
  const threadId = Number(searchParams.get("threadId")) || 1;

  return (
    <Box height="100vh" bg="white">
      <Conversation selectedThreadId={threadId} />
    </Box>
  );
}
