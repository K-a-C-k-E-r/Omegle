# 🚀 COMPLETE SETUP GUIDE

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Your `.env` file is already configured with:

- ✅ Supabase credentials
- ✅ Cloudinary credentials

### 3. Set Up Supabase Database

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on "SQL Editor" in the left menu
3. Copy and paste the entire content from `supabase-schema.sql`
4. Click "Run" to create all tables

### 4. Start the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

---

## ✨ Features Implemented

### Landing Page

- ✅ Interest tags system
- ✅ Find users with common interests
- ✅ Safety warnings and guidelines
- ✅ FAQ section
- ✅ Online user statistics (real-time)
- ✅ Chat count statistics

### Chat Interface

- ✅ Random stranger matching
- ✅ Real-time messaging
- ✅ Image sharing with preview
- ✅ Country tracking (IP-based)
- ✅ Connection status indicators
- ✅ Auto-search on entry
- ✅ Back to home button

### Backend & Database

- ✅ Socket.IO for real-time communication
- ✅ Supabase for data storage
- ✅ Cloudinary for image hosting
- ✅ User connection tracking
- ✅ Chat session logging
- ✅ Message history storage
- ✅ Session duration tracking
- ✅ Country-based analytics

---

## 📸 How to Use Image Sharing

1. Start a chat
2. Click the 📎 (paperclip) icon
3. Select an image (max 5MB)
4. Preview appears - click "Send"
5. Image is uploaded to Cloudinary
6. Both users can see the image

---

## 🌍 Analytics & Tracking

All data is automatically stored in Supabase:

**User Connections Table:**

- Socket ID
- Country (from IP)
- Connection/Disconnection times

**Chat Sessions Table:**

- Session ID
- Both users' IDs and countries
- Start/End times
- Duration in seconds

**Chat Messages Table:**

- Session ID
- Sender ID
- Message text
- Image URL (if any)
- Timestamp

---

## 🎨 UI/UX Features

- Responsive design (works on mobile)
- Smooth animations
- Loading states
- Error handling
- Image preview before sending
- Auto-scroll to latest message
- Connection status indicators
- Online user count (live)

---

## 🔧 Tech Stack

**Frontend:**

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Socket.IO Client

**Backend:**

- Node.js
- Socket.IO Server (integrated with Next.js)
- Supabase (PostgreSQL)
- Cloudinary
- GeoIP Lite

---

## 📊 Database Queries You Can Run

### See all active users:

```sql
SELECT country, COUNT(*) as count
FROM user_connections
WHERE disconnected_at IS NULL
GROUP BY country
ORDER BY count DESC;
```

### See today's chats:

```sql
SELECT COUNT(*) as total_chats,
       AVG(duration_seconds) as avg_duration
FROM chat_sessions
WHERE started_at >= CURRENT_DATE;
```

### See most popular countries:

```sql
SELECT user1_country as country, COUNT(*) as chats
FROM chat_sessions
GROUP BY user1_country
ORDER BY chats DESC
LIMIT 10;
```

---

## 🎯 Testing Checklist

- [ ] Landing page loads
- [ ] Click "Text" button
- [ ] Auto-search starts
- [ ] Open in 2 browser windows to test matching
- [ ] Send text messages
- [ ] Upload and send an image
- [ ] Click "Stop" to disconnect
- [ ] Click "New" to find another stranger
- [ ] Click "Back to Home"
- [ ] Check Supabase tables for data

---

## 🐛 Troubleshooting

**Can't connect to chat:**

- Make sure server is running: `npm run dev`
- Check browser console for errors
- Verify Socket.IO connection in Network tab

**Images not uploading:**

- Check Cloudinary credentials in `.env`
- Verify image is under 5MB
- Check browser console for upload errors

**No data in Supabase:**

- Verify SQL schema was run
- Check Supabase credentials in `.env`
- Look for errors in server terminal

**"Module not found" errors:**

- Run `npm install` again
- Delete `node_modules` and `.next` folders
- Run `npm install` then `npm run dev`

---

## 🚀 Deployment

### Deploy to Vercel:

```bash
npm run build
vercel --prod
```

### Environment Variables for Production:

- Add all `.env` variables to Vercel dashboard
- Update Cloudinary settings for production URLs
- Configure Supabase for production

---

## 📝 Notes

- Images are stored permanently in Cloudinary (check your usage)
- Supabase free tier has limits (check quotas)
- IP geolocation works best with real IPs (not localhost)
- For production, add rate limiting and moderation

---

## 🎉 You're All Set!

Your Omegle clone is now fully functional with:

- Real-time chat
- Image sharing
- Country tracking
- Full analytics
- Beautiful UI

**Need help?** Check the code comments or ask!
