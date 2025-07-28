"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessageDto } from '@/types/api/chat';
import { getToken } from '@/lib/auth-utils';

interface UseWebSocketProps {
  threadId?: number;
  onMessageReceived?: (message: ChatMessageDto) => void;
}

// WebSocket 서버 주소 설정
const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8081/ws/chat';

export const useWebSocket = ({ threadId, onMessageReceived }: UseWebSocketProps) => {
  const client = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!threadId || typeof window === 'undefined') return;

    // 최대 재연결 시도 횟수 초과 시 중단
    if (connectionAttempts >= maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }

    try {
      console.log(`Attempting to connect to WebSocket... (attempt ${connectionAttempts + 1})`, SOCKET_URL);
      
      const token = getToken();
      const newClient = new Client({
        brokerURL: SOCKET_URL,
        connectHeaders: token ? {
          Authorization: `Bearer ${token}`
        } : {},
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: Math.min(5000 * Math.pow(2, connectionAttempts), 30000), // 지수 백오프
        heartbeatIncoming: 10000,  // 10초로 증가
        heartbeatOutgoing: 10000,  // 10초로 증가
        webSocketFactory: () => new SockJS(SOCKET_URL)
      });

      newClient.onConnect = () => {
        console.log('Successfully connected to WebSocket');
        setIsConnected(true);
        setConnectionAttempts(0); // 연결 성공 시 시도 횟수 리셋
        
        if (client.current) {
          // 채팅방 구독
          client.current.subscribe(`/sub/chat/${threadId}`, (message) => {
            console.log('Received message:', message);
            try {
              const receivedMessage = JSON.parse(message.body) as ChatMessageDto;
              onMessageReceived?.(receivedMessage);
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          });
        }
      };

      newClient.onStompError = (frame) => {
        console.error('STOMP error:', frame);
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
      };

      newClient.onWebSocketError = (event) => {
        console.error('WebSocket error:', event);
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
      };

      newClient.onDisconnect = () => {
        console.log('Disconnected from WebSocket');
        setIsConnected(false);
      };

      // 기존 연결이 있다면 정리
      if (client.current) {
        client.current.deactivate();
      }

      client.current = newClient;
      newClient.activate();
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
    }
  }, [threadId, onMessageReceived, connectionAttempts]);

  const disconnect = useCallback(() => {
    if (client.current) {
      console.log('Disconnecting WebSocket...');
      client.current.deactivate();
      client.current = null;
      setIsConnected(false);
      setConnectionAttempts(0);
    }
  }, []);

  const sendMessage = useCallback((message: ChatMessageDto) => {
    if (!client.current?.connected || !threadId) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      client.current.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify({
          ...message,
          threadId: threadId
        }),
      });
      console.log('Message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [threadId]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [threadId]); // connect, disconnect 의존성 제거하여 무한 루프 방지

  return {
    sendMessage,
    connected: isConnected,
    connectionAttempts,
  };
}; 