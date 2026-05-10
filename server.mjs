import { createServer } from 'node:http';
import { parse } from 'node:url';
import next from 'next';
import { Server } from 'socket.io';

const dev = false;
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const allowedSocketOrigin = process.env.SOCKET_ALLOWED_ORIGIN || (dev ? 'http://localhost:3000' : null);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: allowedSocketOrigin || false,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Make IO globally available for server-side emissions from API routes
  global.io = io;

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> WebSocket Server enabled');
    });
});
