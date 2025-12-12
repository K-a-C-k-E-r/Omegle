const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { createClient } = require('@supabase/supabase-js')
const { getCountryFromIP, getGeoInfo } = require('./lib/geoLocation')
const { uploadImage } = require('./lib/cloudinary')
require('dotenv').config()

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Initialize Supabase (optional - will be null if not configured)
let supabase = null
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
        console.log('✅ Supabase connected')
    } catch (error) {
        console.warn('⚠️  Supabase not configured:', error.message)
    }
} else {
    console.warn('⚠️  Supabase credentials not found - running without database storage')
}

// Store waiting users and active connections
let waitingUsers = []
let activeConnections = new Map() // socketId -> partnerId
let userSessions = new Map() // socketId -> { sessionId, country, ip }
let sessionStartTimes = new Map() // sessionId -> startTime

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })

    const io = new Server(server)

    io.on('connection', async (socket) => {
        console.log('User connected:', socket.id)

        // Get user's IP and country
        const clientIP = socket.handshake.address || socket.request.connection.remoteAddress
        const country = getCountryFromIP(clientIP)
        const geoInfo = getGeoInfo(clientIP)

        console.log(`User from ${country} (${clientIP})`)

        // Store user connection in database
        if (supabase) {
            try {
                await supabase.from('user_connections').insert({
                    socket_id: socket.id,
                    country: country,
                    ip_address: clientIP
                })
            } catch (error) {
                console.error('Error storing user connection:', error)
            }
        }

        // Store user info temporarily
        userSessions.set(socket.id, {
            country,
            ip: clientIP,
            geoInfo
        })

        // Find a stranger for the user
        socket.on('find-stranger', async () => {
            console.log('User looking for stranger:', socket.id)

            // Check if user is already in a chat
            if (activeConnections.has(socket.id)) {
                const partnerId = activeConnections.get(socket.id)
                activeConnections.delete(socket.id)
                activeConnections.delete(partnerId)

                // Notify partner
                io.to(partnerId).emit('stranger-disconnected')
            }

            // Remove from waiting list if already there
            waitingUsers = waitingUsers.filter(id => id !== socket.id)

            // Try to match with a waiting user
            let partnerId = null
            while (waitingUsers.length > 0) {
                const candidateId = waitingUsers.shift()
                
                // Check if partner still exists and is connected
                if (userSessions.has(candidateId)) {
                    partnerId = candidateId
                    break
                } else {
                    console.log('Skipping disconnected user:', candidateId)
                }
            }

            if (partnerId) {
                // Create connection between the two users
                activeConnections.set(socket.id, partnerId)
                activeConnections.set(partnerId, socket.id)

                // Create session ID
                const sessionId = `${socket.id}-${partnerId}-${Date.now()}`
                const startTime = new Date().toISOString()
                sessionStartTimes.set(sessionId, Date.now())

                // Store session for both users
                userSessions.get(socket.id).sessionId = sessionId
                userSessions.get(partnerId).sessionId = sessionId

                // Store chat session in database
                const user1Info = userSessions.get(socket.id)
                const user2Info = userSessions.get(partnerId)

                if (supabase) {
                    try {
                        await supabase.from('chat_sessions').insert({
                            session_id: sessionId,
                            user1_id: socket.id,
                            user2_id: partnerId,
                            user1_country: user1Info.country,
                            user2_country: user2Info.country,
                            started_at: startTime
                        })
                        console.log('Chat session created in database:', sessionId)
                    } catch (error) {
                        console.error('Error creating chat session:', error)
                    }
                }

                // Notify both users they are matched
                socket.emit('matched')
                io.to(partnerId).emit('matched')

                console.log('Matched:', socket.id, 'with', partnerId)
            } else {
                // Add to waiting list
                waitingUsers.push(socket.id)
                socket.emit('searching')
                console.log('Added to waiting list:', socket.id)
            }
        })

        // Handle messages
        socket.on('message', async (data) => {
            const partnerId = activeConnections.get(socket.id)

            if (partnerId) {
                const userSession = userSessions.get(socket.id)
                const messageText = typeof data === 'string' ? data : data.text
                const hasImage = data.image ? true : false
                let imageUrl = null

                // Upload image if present
                if (data.image) {
                    try {
                        const uploadResult = await uploadImage(data.image)
                        if (uploadResult.success) {
                            imageUrl = uploadResult.url
                            console.log('Image uploaded:', imageUrl)
                        }
                    } catch (error) {
                        console.error('Error uploading image:', error)
                    }
                }

                // Store message in database
                if (supabase && userSession && userSession.sessionId) {
                    try {
                        await supabase.from('chat_messages').insert({
                            session_id: userSession.sessionId,
                            sender_id: socket.id,
                            message_text: messageText,
                            has_image: hasImage,
                            image_url: imageUrl,
                            sent_at: new Date().toISOString()
                        })
                    } catch (error) {
                        console.error('Error storing message:', error)
                    }
                }

                // Send message to partner
                io.to(partnerId).emit('message', { text: messageText, image: imageUrl })
                console.log('Message from', socket.id, 'to', partnerId)
            }
        })

        // Handle disconnect chat
        socket.on('disconnect-chat', async () => {
            const partnerId = activeConnections.get(socket.id)

            if (partnerId) {
                // End chat session in database
                const userSession = userSessions.get(socket.id)
                if (supabase && userSession && userSession.sessionId) {
                    const startTime = sessionStartTimes.get(userSession.sessionId)
                    const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0

                    try {
                        await supabase
                            .from('chat_sessions')
                            .update({
                                ended_at: new Date().toISOString(),
                                duration_seconds: duration
                            })
                            .eq('session_id', userSession.sessionId)

                        console.log('Chat session ended:', userSession.sessionId, 'Duration:', duration, 'seconds')
                        sessionStartTimes.delete(userSession.sessionId)
                    } catch (error) {
                        console.error('Error ending chat session:', error)
                    }
                }

                activeConnections.delete(socket.id)
                activeConnections.delete(partnerId)

                io.to(partnerId).emit('stranger-disconnected')
                console.log('Chat disconnected:', socket.id)
            }

            // Remove from waiting list
            waitingUsers = waitingUsers.filter(id => id !== socket.id)
        })

        // Handle user disconnect
        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id)

            // Update user connection record
            if (supabase) {
                try {
                    await supabase
                        .from('user_connections')
                        .update({ disconnected_at: new Date().toISOString() })
                        .eq('socket_id', socket.id)
                } catch (error) {
                    console.error('Error updating user disconnection:', error)
                }
            }

            const partnerId = activeConnections.get(socket.id)

            if (partnerId) {
                // End chat session in database
                const userSession = userSessions.get(socket.id)
                if (supabase && userSession && userSession.sessionId) {
                    const startTime = sessionStartTimes.get(userSession.sessionId)
                    const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0

                    try {
                        await supabase
                            .from('chat_sessions')
                            .update({
                                ended_at: new Date().toISOString(),
                                duration_seconds: duration
                            })
                            .eq('session_id', userSession.sessionId)

                        sessionStartTimes.delete(userSession.sessionId)
                    } catch (error) {
                        console.error('Error ending chat session on disconnect:', error)
                    }
                }

                activeConnections.delete(socket.id)
                activeConnections.delete(partnerId)

                io.to(partnerId).emit('stranger-disconnected')
            }

            // Clean up user session data
            userSessions.delete(socket.id)

            // Remove from waiting list
            waitingUsers = waitingUsers.filter(id => id !== socket.id)
        })
    })

    server.listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on http://${hostname}:${port}`)
        console.log(`> Socket.IO server running on the same port`)
    })
})
