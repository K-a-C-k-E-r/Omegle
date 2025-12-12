const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

describe('Supabase Database Tests', () => {
    let supabase;
    let testSessionId;

    before(() => {
        // Initialize Supabase client
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        console.log('✓ Supabase client initialized');
    });

    it('should connect to Supabase', async () => {
        const { data, error } = await supabase
            .from('user_connections')
            .select('count')
            .limit(1);

        assert.strictEqual(error, null, 'Should connect without errors');
        console.log('✓ Connected to Supabase successfully');
    });

    it('should insert a user connection', async () => {
        const { data, error } = await supabase
            .from('user_connections')
            .insert({
                socket_id: 'test_socket_123',
                country: 'US',
                ip_address: '127.0.0.1'
            })
            .select();

        assert.strictEqual(error, null, 'Should insert without errors');
        assert.ok(data && data.length > 0, 'Should return inserted data');
        console.log('✓ User connection inserted:', data[0].id);
    });

    it('should create a chat session', async () => {
        testSessionId = `test_session_${Date.now()}`;

        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({
                session_id: testSessionId,
                user1_id: 'test_user_1',
                user2_id: 'test_user_2',
                user1_country: 'US',
                user2_country: 'UK'
            })
            .select();

        assert.strictEqual(error, null, 'Should create session without errors');
        assert.ok(data && data.length > 0, 'Should return session data');
        console.log('✓ Chat session created:', testSessionId);
    });

    it('should insert a chat message', async () => {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                session_id: testSessionId,
                sender_id: 'test_user_1',
                message_text: 'Hello, this is a test message!',
                has_image: false
            })
            .select();

        assert.strictEqual(error, null, 'Should insert message without errors');
        assert.ok(data && data.length > 0, 'Should return message data');
        console.log('✓ Chat message inserted');
    });

    it('should insert a message with image', async () => {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                session_id: testSessionId,
                sender_id: 'test_user_2',
                message_text: 'Check out this image!',
                has_image: true,
                image_url: 'https://example.com/test-image.jpg'
            })
            .select();

        assert.strictEqual(error, null, 'Should insert image message without errors');
        assert.ok(data && data.length > 0, 'Should return message data');
        assert.strictEqual(data[0].has_image, true, 'Message should have image flag');
        console.log('✓ Image message inserted');
    });

    it('should retrieve messages for a session', async () => {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', testSessionId)
            .order('sent_at', { ascending: true });

        assert.strictEqual(error, null, 'Should retrieve messages without errors');
        assert.ok(data && data.length >= 2, 'Should have at least 2 messages');
        console.log(`✓ Retrieved ${data.length} messages`);
    });

    it('should update chat session end time', async () => {
        const { data, error } = await supabase
            .from('chat_sessions')
            .update({
                ended_at: new Date().toISOString(),
                duration_seconds: 120
            })
            .eq('session_id', testSessionId)
            .select();

        assert.strictEqual(error, null, 'Should update session without errors');
        assert.strictEqual(data[0].duration_seconds, 120, 'Duration should be 120 seconds');
        console.log('✓ Chat session updated with end time');
    });

    it('should query active users view', async () => {
        const { data, error } = await supabase
            .from('active_users')
            .select('*');

        assert.strictEqual(error, null, 'Should query view without errors');
        console.log('✓ Active users view queried successfully');
    });

    it('should query daily chat stats view', async () => {
        const { data, error } = await supabase
            .from('daily_chat_stats')
            .select('*')
            .limit(5);

        assert.strictEqual(error, null, 'Should query stats view without errors');
        console.log('✓ Daily chat stats queried successfully');
    });

    it('should call get_online_users_count function', async () => {
        const { data, error } = await supabase.rpc('get_online_users_count');

        assert.strictEqual(error, null, 'Should call function without errors');
        assert.ok(typeof data === 'number', 'Should return a number');
        console.log(`✓ Online users count: ${data}`);
    });

    it('should call get_today_chat_count function', async () => {
        const { data, error } = await supabase.rpc('get_today_chat_count');

        assert.strictEqual(error, null, 'Should call function without errors');
        assert.ok(typeof data === 'number', 'Should return a number');
        console.log(`✓ Today's chat count: ${data}`);
    });

    after(async () => {
        // Cleanup: Delete test data
        await supabase
            .from('chat_messages')
            .delete()
            .eq('session_id', testSessionId);

        await supabase
            .from('chat_sessions')
            .delete()
            .eq('session_id', testSessionId);

        await supabase
            .from('user_connections')
            .delete()
            .eq('socket_id', 'test_socket_123');

        console.log('✓ Test data cleaned up');
    });
});
