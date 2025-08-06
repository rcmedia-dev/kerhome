// /pages/api/socket.ts

import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/lib/types/next';

const ioHandler = (_req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Socket.io server starting...');
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: '/api/sockets/socket',
    });

    io.on('connection', socket => {
      console.log('Client connected:', socket.id);

      socket.on('join_room', (chatId: string) => {
        socket.join(chatId);
      });

      socket.on('send_message', (data) => {
        // Broadcast to room
        io.to(data.chat_id).emit('receive_message', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
