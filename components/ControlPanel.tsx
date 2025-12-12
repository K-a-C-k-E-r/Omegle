'use client'

import { useState, KeyboardEvent, useRef } from 'react'

interface ControlPanelProps {
    isConnected: boolean
    isSearching: boolean
    onNewChat: () => void
    onStopChat: () => void
    onSendMessage: (message: string, image?: string) => void
}

export default function ControlPanel({
    isConnected,
    isSearching,
    onNewChat,
    onStopChat,
    onSendMessage
}: ControlPanelProps) {
    const [message, setMessage] = useState('')
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Image size must be less than 5MB')
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSend = () => {
        if (message.trim() || selectedImage) {
            setIsUploading(true)
            onSendMessage(message || '📷 Image', selectedImage || undefined)
            setMessage('')
            setSelectedImage(null)
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="border-t border-gray-200 bg-white">
            {selectedImage && (
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded" />
                            <span className="text-sm text-gray-600">Image ready to send</span>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedImage(null)
                                if (fileInputRef.current) fileInputRef.current.value = ''
                            }}
                            className="text-red-500 hover:text-red-700 font-semibold"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}

            <div className="p-4 flex items-center space-x-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={!isConnected}
                    className="hidden"
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    className={`cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    📎
                </label>

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isConnected ? "Type your message here..." : "Connect to start chatting"}
                    disabled={!isConnected}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-omegle-blue focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                    onClick={handleSend}
                    disabled={!isConnected || (!message.trim() && !selectedImage) || isUploading}
                    className="px-6 py-2 bg-omegle-blue text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                    {isUploading ? 'Sending...' : 'Send'}
                </button>
            </div>

            <div className="px-4 pb-4 flex space-x-3">
                <button
                    onClick={onNewChat}
                    disabled={isSearching}
                    className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow"
                >
                    {isSearching ? 'Searching...' : 'New'}
                </button>
                <button
                    onClick={onStopChat}
                    disabled={!isConnected && !isSearching}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow"
                >
                    Stop
                </button>
            </div>
        </div>
    )
}
