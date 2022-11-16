<script lang="ts" setup>
import { useSockets } from '@/composables/basic-socket-communication';
import { computed } from 'vue';

const { socket, users, connectedTo, callUser } = useSockets();

const talkingWithInfo = computed<string>(() => `Talking with: "Socket: ${ connectedTo.value }"`);

socket.on('move-done', data => {
    console.log('move-done', data);
});

const sendMsg = () => {
    socket.emit('do-move', {
        move: 'test',
        to: connectedTo.value
    });
};
</script>

<template>
  <h1>Chat</h1>
  <div>
    <button v-if="!!connectedTo" type="button" @click.prevent="sendMsg">Send message</button>
  </div>
  <div v-if="!!connectedTo">
    {{ talkingWithInfo }}
  </div>
  <div v-for="user in users" :key="user">
    <button type="button" @click.prevent="() => callUser(user)">{{ `Socket: ${ user }` }}</button>
  </div>
</template>

<style scoped>

</style>