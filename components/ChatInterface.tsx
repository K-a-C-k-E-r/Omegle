'use client'

import { useState, useEffect, useRef } from 'react'
import io, { Socket } from 'socket.io-client'
import Header from './Header'
import ChatBox from './ChatBox'
import ControlPanel from './ControlPanel'

interface Message {
    text: string
    sender: 'stranger' | 'you'
    timestamp: number
    image?: string
}

interface ChatInterfaceProps {
    onBackToHome?: () => void
}

export default function ChatInterface({ onBackToHome }: ChatInterfaceProps) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [connectionStatus, setConnectionStatus] = useState<string>('Click "New" to start chatting')

    useEffect(() => {
        const newSocket = io()
        setSocket(newSocket)

        newSocket.on('connect', () => {
            console.log('Connected to server')
            // Auto-start searching when entering chat
            newSocket.emit('find-stranger')
            setIsSearching(true)
        })

        newSocket.on('matched', () => {
            setIsConnected(true)
            setIsSearching(false)
            setConnectionStatus('You\'re now chatting with a random stranger!')
            setMessages([])
        })

        newSocket.on('message', (data: any) => {
            const messageData = typeof data === 'string' ? { text: data, image: undefined } : data
            setMessages(prev => [...prev, {
                text: messageData.text,
                sender: 'stranger',
                timestamp: Date.now(),
                image: messageData.image
            }])
        })

        newSocket.on('stranger-disconnected', () => {
            setIsConnected(false)
            setConnectionStatus('Stranger has disconnected.')
        })

        newSocket.on('searching', () => {
            setIsSearching(true)
            setConnectionStatus('Looking for someone you can chat with...')
        })

        return () => {
            newSocket.close()
        }
    }, [])

    const handleNewChat = () => {
        if (socket) {
            setMessages([])
            setIsConnected(false)
            setIsSearching(true)
            socket.emit('find-stranger')
        }
    }

    const handleStopChat = () => {
        if (socket) {
            socket.emit('disconnect-chat')
            setIsConnected(false)
            setIsSearching(false)
            setConnectionStatus('You have disconnected.')
        }
    }

    const handleSendMessage = (message: string, image?: string) => {
        if (socket && isConnected && (message.trim() || image)) {
            const messageData = image ? { text: message, image } : message
            socket.emit('message', messageData)
            setMessages(prev => [...prev, {
                text: message,
                sender: 'you',
                timestamp: Date.now(),
                image
            }])
        }
    }

    return (
        <div className="flex flex-col h-screen">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="bg-omegle-blue text-white px-6 py-3">
                        <p className="text-sm font-medium">{connectionStatus}</p>
                    </div>

                    <ChatBox messages={messages} isConnected={isConnected} />

                    <ControlPanel
                        isConnected={isConnected}
                        isSearching={isSearching}
                        onNewChat={handleNewChat}
                        onStopChat={handleStopChat}
                        onSendMessage={handleSendMessage}
                    />

                    {onBackToHome && (
                        <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                            <button
                                onClick={onBackToHome}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
                            >
                                ← Back to Home
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p className="mb-2">
                        <strong>Omegle</strong> lets you talk to strangers instantly. Just click "New" to start a chat!
                    </p>
                    <p className="text-xs text-gray-500">
                        ⚠️ Please be respectful and follow community guidelines.
                    </p>
                </div>
            </div>
        </div>
    )
}
