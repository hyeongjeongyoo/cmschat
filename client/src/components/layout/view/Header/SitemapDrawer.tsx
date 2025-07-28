"use client";

import {
  Box,
  Flex,
  Link,
  Drawer,
  Portal,
  VStack,
  HStack,
  Text as ChakraText,
  Icon,
  IconButton,
  Button,
} from "@chakra-ui/react";
import Image from "next/image";
import { memo, useState, useEffect, useCallback } from "react";
import NextLink from "next/link";
import { Menu } from "@/types/api";
import {
  Globe,
  Type,
  Smile,
  X as LargeCloseIcon,
  User2Icon,
  LogOutIcon,
} from "lucide-react";
import { useRecoilValue } from "recoil";
import { authState, useAuthActions } from "@/stores/auth";
import { useRouter } from "next/navigation";

interface SitemapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menusWithLastFlag: (Menu & { isLastMenuItem?: boolean })[];
  isMenuActive: (menuUrl: string | undefined) => boolean;
  isDark: boolean;
  width: number;
  height: number;
}

export const SitemapDrawer = memo(
  ({
    isOpen,
    onClose,
    menusWithLastFlag,
    isDark,
    width,
    height,
  }: SitemapDrawerProps) => {
    const router = useRouter();

    const [selectedCategoryKey, setSelectedCategoryKey] = useState<
      number | null
    >(
      menusWithLastFlag.filter((m) => m.children && m.children.length > 0)[0]
        ?.id ||
        menusWithLastFlag[0]?.id ||
        null
    );

    const { isAuthenticated } = useRecoilValue(authState);
    const { logout } = useAuthActions();

    const topLevelMenus = menusWithLastFlag.filter(
      (menu) => !menu.parentId || menu.parentId === 0
    );
    const handleNavigate = useCallback(
      (path: string) => {
        router.push(path);
        onClose(); // Close drawer after navigation
      },
      [router]
    );
    const handleLogout = useCallback(async () => {
      try {
        await logout();
        onClose(); // Close drawer after logout
      } catch (error) {
        console.error("Logout error:", error);
        // logout() already handles error cases and cleans up local state
        onClose(); // Still close drawer even if logout fails
      }
    }, [logout]);

    // The right panel will display content based on ALL topLevelMenus, not just the selected one.
    // The selectedCategoryKey is now mainly for styling the left sidebar.

    const handleCategoryClick = (categoryId: number) => {
      setSelectedCategoryKey(categoryId);
      const sectionElement = document.getElementById(
        `sitemap-section-${categoryId}`
      );
      if (sectionElement) {
        // Find the scrollable container for the right panel
        const scrollableContainer =
          document.getElementById("sitemapRightPanel");
        if (scrollableContainer) {
          // Calculate the offset of the target element relative to the scrollable container
          const scrollTop =
            sectionElement.offsetTop - scrollableContainer.offsetTop;
          scrollableContainer.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }
      }
    };

    // Hide body scroll when drawer is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }

      return () => {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      };
    }, [isOpen]);

    return (
      <Drawer.Root
        open={isOpen}
        onOpenChange={(e) => {
          if (!e.open) onClose();
        }}
        placement="end"
        size="full"
        modal={true}
      >
        <Portal>
          <Drawer.Backdrop
            bg={isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)"}
          />
          <Drawer.Positioner>
            <Drawer.Content bg={isDark ? "gray.800" : "white"} boxShadow="none">
              <Flex
                as="header"
                align="center"
                justify="center"
                borderBottomWidth="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
                h={{ base: "60px", lg: "70px" }}
              >
                <Flex
                  align="center"
                  justify="space-between"
                  maxW={{ base: "90%", "2xl": "1600px" }}
                  w="full"
                >
                  <Link as={NextLink} href="/" onClick={onClose}>
                    <Image
                      src={
                        isDark
                          ? "/images/logo/logo_w.png"
                          : "/images/logo/logo.png"
                      }
                      width={width}
                      height={height}
                      alt="logo"
                    />
                  </Link>
                  <HStack>
                    {/* <Image
                      src="/images/logo/부산도시공사_logo.png"
                      width={120}
                      height={40}
                      alt="부산도시공사 로고"
                    /> */}
                    <VStack>
                      {isAuthenticated ? (
                        <Flex gap={2}>
                          <Button
                            variant="ghost"
                            onClick={() => handleNavigate("/mypage")}
                            color={isDark ? "gray.200" : "gray.700"}
                            justifyContent="flex-start"
                            size="xs"
                            p={0}
                          >
                            <User2Icon size={18} />
                            마이페이지
                          </Button>
                          <Button
                            variant="ghost"
                            colorPalette="red"
                            onClick={handleLogout}
                            justifyContent="flex-start"
                            size="xs"
                            p={0}
                          >
                            <LogOutIcon size={18} />
                            로그아웃
                          </Button>
                        </Flex>
                      ) : (
                        <Flex gap={2}>
                          <Button
                            flex={1}
                            justifyContent="center"
                            variant="outline"
                            onClick={() => handleNavigate("/login")}
                            color={isDark ? "gray.200" : "gray.700"}
                            size="xs"
                          >
                            로그인
                          </Button>
                          <Button
                            flex={1}
                            justifyContent="center"
                            variant="solid"
                            colorPalette="blue"
                            onClick={() => handleNavigate("/signup")}
                            size="xs"
                          >
                            회원가입
                          </Button>
                        </Flex>
                      )}
                    </VStack>
                    <Icon
                      as={Globe}
                      boxSize={5}
                      color={isDark ? "gray.400" : "gray.600"}
                      display={{ base: "none", md: "block" }}
                    />
                    <Icon
                      as={Type}
                      boxSize={5}
                      color={isDark ? "gray.400" : "gray.600"}
                      display={{ base: "none", md: "block" }}
                    />
                    <Icon
                      as={Smile}
                      boxSize={5}
                      color={isDark ? "gray.400" : "gray.600"}
                      display={{ base: "none", md: "block" }}
                    />
                    <IconButton
                      aria-label="Close sitemap"
                      onClick={onClose}
                      variant="ghost"
                      size="lg"
                      color={isDark ? "white" : "black"}
                    >
                      <LargeCloseIcon />
                    </IconButton>
                  </HStack>
                </Flex>
              </Flex>

              <Drawer.Body p={0}>
                <Box
                  h={{
                    base: "calc(100vh - 60px - 50px)",
                    lg: "calc(100vh - 70px - 50px)",
                  }}
                  overflowY="scroll"
                  css={{
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: isDark ? "#2D3748" : "#F7FAFC",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: isDark ? "#4A5568" : "#CBD5E0",
                      borderRadius: "6px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      background: isDark ? "#718096" : "#A0AEC0",
                    },
                  }}
                >
                  <Flex
                    h="auto"
                    justify="center"
                    minH={{
                      base: "calc(100vh - 60px - 50px)",
                      lg: "calc(100vh - 70px - 50px)",
                    }}
                  >
                    <VStack
                      as="aside"
                      w="full"
                      maxW="1200px"
                      bg={isDark ? "gray.800" : "white"}
                      p={10}
                      gap={8}
                      align="flex-start"
                    >
                      {topLevelMenus.map((menu) => (
                        <Box key={menu.id} w="full">
                          <ChakraText
                            fontSize={{ base: "24px", md: "2xl", lg: "3xl" }}
                            fontFamily="paperlogy"
                            fontWeight={
                              selectedCategoryKey === menu.id ? "700" : "600"
                            }
                            color={isDark ? "gray.100" : "gray.700"}
                            onClick={() => handleCategoryClick(menu.id)}
                            cursor="pointer"
                            position="relative"
                            zIndex={2}
                            _after={{
                              content: '""',
                              position: "absolute",
                              bottom: "-8px",
                              left: "55px",
                              transform: "translateX(-50%)",
                              width: "120px",
                              height: "20px",
                              bg:
                                selectedCategoryKey === menu.id
                                  ? "rgba(224, 225, 255, 0.5)"
                                  : "rgba(224, 225, 255, 0)",
                              borderRadius: "1px",
                              transition: "all 0.3s ease",
                              zIndex: 1,
                            }}
                            _hover={{
                              _after: {
                                content: '""',
                                position: "absolute",
                                bottom: "-8px",
                                left: "55px",
                                transform: "translateX(-50%)",
                                width: "120px",
                                height: "20px",
                                bg: "rgba(224, 225, 255, 0.5)",
                                borderRadius: "1px",
                              },
                            }}
                            w="full"
                            transition="all 0.2s ease"
                            mb={6}
                          >
                            {menu.name}
                          </ChakraText>

                          {/* Child menus displayed under each top-level menu */}
                          {menu.children && menu.children.length > 0 && (
                            <Flex
                              wrap="wrap"
                              gap={
                                menu.children.some(
                                  (child) =>
                                    child.children && child.children.length > 0
                                )
                                  ? 7
                                  : { base: 4, md: 7 }
                              }
                              align="flex-start"
                              w="full"
                              pb={4}
                              borderBottomWidth="1px"
                              borderBottomColor={
                                isDark ? "gray.600" : "gray.300"
                              }
                              mb={6}
                            >
                              {menu.children.map((level2Menu) => (
                                <Box key={level2Menu.id} minW="150px">
                                  {level2Menu.url ? (
                                    <Link
                                      as={NextLink}
                                      href={level2Menu.url}
                                      onClick={onClose}
                                      fontWeight="medium"
                                      fontSize={{ base: "md", md: "lg" }}
                                      fontFamily="paperlogy"
                                      mb={3}
                                      color={isDark ? "gray.100" : "gray.800"}
                                      _hover={{
                                        fontWeight: "semibold",
                                      }}
                                      display="block"
                                    >
                                      {level2Menu.name}
                                    </Link>
                                  ) : (
                                    <ChakraText
                                      fontWeight="medium"
                                      fontSize={{ base: "md", md: "lg" }}
                                      fontFamily="paperlogy"
                                      mb={3}
                                      color={isDark ? "gray.100" : "gray.800"}
                                    >
                                      {level2Menu.name}
                                    </ChakraText>
                                  )}
                                  {level2Menu.children &&
                                  level2Menu.children.length > 0 ? (
                                    <VStack align="flex-start" gap={1.5} pl={0}>
                                      {level2Menu.children.map((level3Link) => (
                                        <Link
                                          key={level3Link.id}
                                          as={NextLink}
                                          href={level3Link.url || "#"}
                                          onClick={onClose}
                                          fontSize={{ base: "sm", md: "md" }}
                                          fontFamily="paperlogy"
                                          color={
                                            isDark ? "gray.300" : "gray.600"
                                          }
                                          _hover={{
                                            fontWeight: "semibold",
                                          }}
                                          display="block"
                                        >
                                          {level3Link.name}
                                        </Link>
                                      ))}
                                    </VStack>
                                  ) : null}
                                </Box>
                              ))}
                            </Flex>
                          )}
                        </Box>
                      ))}
                      <Box flex={1} />
                    </VStack>
                  </Flex>
                </Box>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    );
  }
);

SitemapDrawer.displayName = "SitemapDrawer";
export default SitemapDrawer;
