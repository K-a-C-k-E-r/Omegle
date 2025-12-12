const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');

describe('Socket.IO Integration Tests', () => {
  let io, httpServer;
  const port = 3002;

  before(async () => {
    httpServer = createServer();
    io = new Server(httpServer);
    
    await new Promise((resolve) => {
      httpServer.listen(port, () => {
        console.log('Test server started on port', port);
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => {
      if (io) {
        io.close(() => {
          if (httpServer) {
            httpServer.close(() => {
              console.log('Test server closed');
              resolve();
            });
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });

  it('should connect a client', async () => {
    const clientSocket = Client(`http://localhost:${port}`);
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        clientSocket.close();
        reject(new Error('Connection timeout'));
      }, 5000);

      clientSocket.on('connect', () => {
        clearTimeout(timeout);
        console.log('Client connected successfully');
        clientSocket.close();
        resolve();
      });

      clientSocket.on('connect_error', (err) => {
        clearTimeout(timeout);
        clientSocket.close();
        reject(err);
      });
    });
  });

  it('should handle basic message exchange', async () => {
    io.on('connection', (socket) => {
      socket.on('test-message', (msg) => {
        socket.emit('test-response', `Echo: ${msg}`);
      });
    });

    const clientSocket = Client(`http://localhost:${port}`);
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        clientSocket.close();
        reject(new Error('Test timeout'));
      }, 5000);

      clientSocket.on('connect', () => {
        clientSocket.emit('test-message', 'Hello Server');
      });

      clientSocket.on('test-response', (msg) => {
        clearTimeout(timeout);
        assert.strictEqual(msg, 'Echo: Hello Server');
        console.log('Message exchange working');
        clientSocket.close();
        resolve();
      });

      clientSocket.on('error', (err) => {
        clearTimeout(timeout);
        clientSocket.close();
        reject(err);
      });
    });
  });

  it('should handle disconnection', async () => {
    const tempClient = Client(`http://localhost:${port}`);
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        tempClient.close();
        reject(new Error('Disconnect timeout'));
      }, 5000);

      tempClient.on('connect', () => {
        tempClient.disconnect();
      });

      tempClient.on('disconnect', () => {
        clearTimeout(timeout);
        console.log('Disconnection handled');
        resolve();
      });
    });
  });
});
