<script lang="ts" setup>
import GameBoard from './game-board.vue';
import type {IPlayer} from '@/stores/game';
import {useGameStore} from '@/stores/game';

const gameStore = useGameStore();

const boardCreated = (players: IPlayer[]) => {
  gameStore.setCurrentPlayer(players[0]);
};

const turnEnded = () => {
  gameStore.turnEnded();
};
</script>

<template>
  <div>
    <h1>Game</h1>
    <game-board
        :number-of-players="2"
        :number-of-pits="6"
        :number-of-starting-stones="6"
        @created="boardCreated"
        @turn-ended="turnEnded"
    />
  </div>
</template>