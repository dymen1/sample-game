<script lang="ts" setup>
import LargePit from './large-pit.vue';
import SmallPit from './small-pit.vue';
import {ObjectEmitsOptions} from '@vue/runtime-core';
import {onMounted, watch} from 'vue';
import {IPit, IPlayer, useGameStore} from '@/stores/game';
import {useSockets} from '@/composables/basic-socket-communication';

const { socket, connectedTo } = useSockets();

interface BoardEvents extends ObjectEmitsOptions {
  (e: 'created', players: IPlayer[]): void;

  (e: 'turnEnded'): void;
}

const emits = defineEmits<BoardEvents>();

interface BoardProps {
  numberOfPlayers: number;
  numberOfPits: number;
  numberOfStartingStones: number;
}

const props = defineProps<BoardProps>();

const gameStore = useGameStore();

onMounted(() => {
  gameStore.createBoard(
      props.numberOfPlayers,
      props.numberOfPits,
      props.numberOfStartingStones,
  );
  emits('created', gameStore.players);
});

const pitClickHandler = (pit: IPit) => {
  if (connectedTo.value) {
    socket.emit('do-move', {
      move: pit.id,
      to: connectedTo.value
    });
  }

  gameStore.playStonesFromPit(pit);
  emits('turnEnded');
}

socket.on('move-done', data => {
  console.log('game-board :: move-done', data.move);
  const pitId = Number.parseInt(data.move);
  if (!pitId) {
    console.log('game-board :: Received move wasn\'t a valid pit ID', data.move);
    return;
  }

  console.log(gameStore.allPits[pitId]);
  gameStore.playStonesFromPit(gameStore.allPits[pitId]);
  emits('turnEnded');
});

</script>

<template>
  <div>
    <h2>Board</h2>
    <h3>Current player: {{ gameStore.currentPlayer }}</h3>
    <div class="board">
      <div v-for="(player, playerKey) in gameStore.players" :key="`player-${playerKey}`" class="player" :class="{ 'player--alternate': 2 === player.id }">
        <div>
          <h3>Player {{ player.id }}</h3>
          <large-pit :pit="player.largePit"/>
        </div>
        <div class="pits">
          <small-pit v-for="(pit, pitKey) in player.pits" :key="`pit-${playerKey}-${pitKey}`" :pit="pit" @click.prevent="pitClickHandler(pit)"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.player {
  background-color: #ddddbb;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: 1rem;
  position: relative;
  left: -4rem;
}

.player--alternate {
  background-color: #ffdddd;
  flex-direction: row-reverse;
  left: unset;
  top: -4rem;
  right: -4rem;
}

.pits {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: 1rem;
}

.player--alternate .pits {
  flex-direction: row;
  align-items: flex-end;
}
</style>