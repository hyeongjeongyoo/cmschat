import "@/styles/globals.css";
import "@/styles/fonts.css";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { Box } from "@chakra-ui/react";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <div id="google_translate_element" style={{ display: "none" }}></div>
        <Providers>
          {children}
          <ChatWindow />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
