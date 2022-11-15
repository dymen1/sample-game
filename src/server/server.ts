// @ts-ignore
import express, { Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';

export class Server {
    private readonly httpServer: HTTPServer;
    private readonly app: Express;
    private io: SocketIOServer;

    private activeSockets: string[] = [];

    private readonly DEFAULT_PORT = 5000;

    constructor() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = new SocketIOServer(this.httpServer, {
            cors: {
                origin: 'http://localhost:5173',
                methods: [ 'GET', 'POST' ]
            }
        });

        this.handleSocketConnection();
    }

    private handleSocketConnection(): void {
        this.io.on('connection', socket => {
            const existingSocket = this.activeSockets.find(
                existingSocket => existingSocket === socket.id
            );

            if (!existingSocket) {
                this.activeSockets.push(socket.id);

                socket.emit('update-user-list', {
                    users: this.activeSockets.filter(
                        existingSocket => existingSocket !== socket.id
                    )
                });

                socket.broadcast.emit('update-user-list', {
                    users: [ socket.id ]
                });
            }

            socket.on('start-call', (data: any) => {
                socket.to(data.to).emit('call-received', {
                    offer: data.offer,
                    socket: socket.id
                });
            });

            socket.on('accept-call', data => {
                socket.to(data.to).emit('call-accepted', {
                    socket: socket.id,
                    answer: data.answer
                });
            });

            socket.on('do-move', data => {
                socket.to(data.to).emit('move-done', {
                    move: data.move
                });
            });

            socket.on('disconnect', () => {
                this.activeSockets = this.activeSockets.filter(
                    existingSocket => existingSocket !== socket.id
                );
                socket.broadcast.emit('remove-user', {
                    socketId: socket.id
                });
            });
        });
    }

    public listen(callback: (port: number) => void): void {
        this.httpServer.listen(this.DEFAULT_PORT, () => {
            callback(this.DEFAULT_PORT);
        });
    }
}
