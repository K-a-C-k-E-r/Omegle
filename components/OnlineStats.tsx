'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OnlineStats() {
    const [onlineCount, setOnlineCount] = useState<number>(0)
    const [totalChats, setTotalChats] = useState<number>(0)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Get active connections (connected in last 5 minutes)
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
                const { count: activeCount } = await supabase
                    .from('user_connections')
                    .select('*', { count: 'exact', head: true })
                    .gte('connected_at', fiveMinutesAgo)
                    .is('disconnected_at', null)

                // Get total chat sessions today
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const { count: chatCount } = await supabase
                    .from('chat_sessions')
                    .select('*', { count: 'exact', head: true })
                    .gte('started_at', today.toISOString())

                setOnlineCount((activeCount || 0) + 5000)
                setTotalChats(chatCount || 0)
            } catch (error) {
                console.error('Error fetching stats:', error)
            }
        }

        fetchStats()
        const interval = setInterval(fetchStats, 30000) // Update every 30 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span><strong>{onlineCount}</strong> online now</span>
            </div>
            <div>
                <span><strong>{totalChats}</strong> chats today</span>
            </div>
        </div>
    )
}
