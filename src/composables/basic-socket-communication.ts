import io, { Socket } from 'socket.io-client';
import { ref } from 'vue';

const isCalling = ref<boolean>(false);
const connectedTo = ref<string>();

const users = ref<string[]>([]);

// please note that the types are reversed
const socket: Socket = io('localhost:5000').connect();

export function useSockets() {
    socket.on('update-user-list', ({ users: socketIds }: { users: string[] }) => {
        socketIds.forEach(socketId => {
            const alreadyExistingUser = users.value.includes(socketId);
            if (alreadyExistingUser) {
                return;
            }
            users.value.push(socketId);
        });
    });

    socket.on('remove-user', ({ socketId }: { socketId: string }) => {
        const index = users.value.indexOf(socketId);
        if (index > -1) {
            users.value.splice(index, 1);
        }

        if (socketId !== connectedTo.value) {
            return;
        }
        connectedTo.value = '';
    });

    socket.on('call-received', async (data: { socket: string, offer: any }) => {
        connectedTo.value = data.socket;

        socket.emit('accept-call', {
            to: data.socket
        });
    });

    const callUser = (socketId: string) => {
        socket.emit('start-call', {
            offer: 'offer',
            to: socketId
        });
    };

    socket.on('call-accepted', async data => {
        if (isCalling.value) {
            return;
        }
        connectedTo.value = data.socket;
        isCalling.value = true;
    });

    return {
        socket,
        users,
        connectedTo,
        callUser
    };
}