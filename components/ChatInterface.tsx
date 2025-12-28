'use client'

import { useState, useEffect, useRef } from 'react'
import io, { Socket } from 'socket.io-client'
import OnlineStats from './OnlineStats'

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
    const [strangerCountry, setStrangerCountry] = useState<string>('')
    const [connectionStatus, setConnectionStatus] = useState<string>('Click "Skip" to start chatting')
    const [message, setMessage] = useState('')
    const [showRules, setShowRules] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (showRules) return // Don't connect until rules are accepted

        const newSocket = io({
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })
        setSocket(newSocket)

        newSocket.on('connect', () => {
            console.log('Connected to server with ID:', newSocket.id)
            newSocket.emit('find-stranger')
            setIsSearching(true)
            setConnectionStatus('Looking for someone you can chat with...')
        })

        newSocket.on('connect_error', (err) => {
            console.error('Connection error:', err)
            setConnectionStatus('Connection error. Retrying...')
        })

        newSocket.on('matched', (data: any) => {
            console.log('Matched with a stranger!', data)
            setIsConnected(true)
            setIsSearching(false)
            const country = data?.country || 'Unknown'
            setStrangerCountry(country)
            setConnectionStatus(`You're now chatting with a stranger from ${country}!`)
            setMessages([])
        })

        newSocket.on('message', (data: any) => {
            console.log('Message received:', data)
            const messageData = typeof data === 'string' ? { text: data, image: undefined } : data
            setMessages(prev => [...prev, {
                text: messageData.text,
                sender: 'stranger',
                timestamp: Date.now(),
                image: messageData.image
            }])
        })

        newSocket.on('stranger-disconnected', () => {
            console.log('Stranger disconnected')
            setIsConnected(false)
            setStrangerCountry('')
            setConnectionStatus('Stranger has disconnected.')
        })

        newSocket.on('searching', () => {
            console.log('Searching for a stranger...')
            setIsSearching(true)
            setConnectionStatus('Looking for someone you can chat with...')
        })

        return () => {
            console.log('Closing socket connection')
            newSocket.close()
        }
    }, [showRules])

    const handleNewChat = () => {
        if (socket) {
            setMessages([])
            setIsConnected(false)
            setIsSearching(true)
            setStrangerCountry('')
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

    const handleSendMessage = () => {
        if (socket && isConnected && message.trim()) {
            socket.emit('message', message)
            setMessages(prev => [...prev, {
                text: message,
                sender: 'you',
                timestamp: Date.now(),
            }])
            setMessage('')
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleAgreeRules = () => {
        setShowRules(false)
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="22" fill="#0099ff" fillOpacity="0.2" />
                        <text x="24" y="32" fontSize="24" fill="#0099ff" fontWeight="bold" textAnchor="middle">O</text>
                    </svg>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: '#ff6600' }}>omegle</h1>
                        <p className="text-sm text-gray-600">Talk to strangers!</p>
                    </div>
                </div>
                <OnlineStats />
            </header>

            {/* Rules Modal */}
            {showRules && (
                <div className="absolute inset-0 bg-white z-50 flex items-start justify-center pt-20 px-4">
                    <div className="bg-white max-w-2xl w-full">
                        <div className="mb-6">
                            <p className="text-blue-500 text-sm mb-4">
                                <span className="font-bold">omegleweb.io</span>: Talk to strangers!
                            </p>
                            <h2 className="text-xl font-bold mb-4">Welcome to OmegleWeb.io, please read the rules below:</h2>
                            <p className="text-red-600 font-bold mb-3">You must be at least 18 years old</p>
                            <ul className="space-y-2 text-gray-700 mb-6">
                                <li>No nudity, hate speech, or harassment</li>
                                <li>Do not ask for gender. This is not a dating site</li>
                                <li>Respect others and be kind</li>
                                <li>Violators will be banned</li>
                            </ul>
                            <button
                                onClick={handleAgreeRules}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
                            >
                                I Agree
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Status */}
            <div className="bg-gray-100 px-4 py-2 text-sm text-gray-700 border-b border-gray-300">
                {connectionStatus}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
                {messages.length === 0 && !isSearching && (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Start chatting by clicking Skip to find a stranger!</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className="mb-2">
                        <span className="font-bold text-sm" style={{ color: msg.sender === 'you' ? '#0000FF' : '#FF0000' }}>
                            {msg.sender === 'you' ? 'You' : 'Stranger'}:
                        </span>
                        <span className="ml-2 text-sm text-black">{msg.text}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Control Panel */}
            <div className="border-t border-gray-300 bg-white p-2 flex items-center space-x-2">
                <button
                    onClick={handleNewChat}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded text-lg min-w-[120px]"
                >
                    Skip
                    <div className="text-xs font-normal">Esc</div>
                </button>

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-black"
                />

                <button
                    onClick={handleSendMessage}
                    disabled={!isConnected || !message.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-lg min-w-[120px]"
                >
                    Send
                    <div className="text-xs font-normal">Enter</div>
                </button>
            </div>
        </div>
    )
}
