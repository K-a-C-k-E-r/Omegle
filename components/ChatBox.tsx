'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface Message {
    text: string
    sender: 'stranger' | 'you'
    timestamp: number
    image?: string
}

interface ChatBoxProps {
    messages: Message[]
    isConnected: boolean
}

export default function ChatBox({ messages, isConnected }: ChatBoxProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <div className="h-96 overflow-y-auto bg-gray-50 p-4 space-y-3">
            {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <p>No messages yet. Start chatting!</p>
                </div>
            )}

            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`message flex ${message.sender === 'you' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'you'
                            ? 'bg-omegle-blue text-white'
                            : 'bg-gray-300 text-gray-800'
                            }`}
                    >
                        <p className="text-xs font-semibold mb-1">
                            {message.sender === 'you' ? 'You' : 'Stranger'}
                        </p>
                        {message.image && (
                            <div className="mb-2">
                                <img
                                    src={message.image}
                                    alt="Shared image"
                                    className="max-w-full h-auto rounded cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(message.image, '_blank')}
                                />
                            </div>
                        )}
                        <p className="text-sm break-words">{message.text}</p>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    )
}
