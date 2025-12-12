'use client'

import { useState } from 'react'
import LandingPage from '@/components/LandingPage'
import ChatInterface from '@/components/ChatInterface'
import Header from '@/components/Header'

export default function Home() {
    const [showChat, setShowChat] = useState(false)
    const [interests, setInterests] = useState<string[]>([])
    const [findCommonInterests, setFindCommonInterests] = useState(false)

    const handleStartChat = (userInterests: string[], findCommon: boolean) => {
        setInterests(userInterests)
        setFindCommonInterests(findCommon)
        setShowChat(true)
    }

    const handleBackToHome = () => {
        setShowChat(false)
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {!showChat ? (
                <>
                    <Header />
                    <LandingPage onStartChat={handleStartChat} />
                </>
            ) : (
                <ChatInterface onBackToHome={handleBackToHome} />
            )}
        </main>
    )
}
