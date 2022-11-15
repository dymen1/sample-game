import {computed, ref} from 'vue';
import {defineStore} from 'pinia';

export interface IPlayer {
  id: number,
  largePit: IPit,
  pits: IPit[],
}

export interface IPit {
  id: number,
  isLarge: boolean
  player: IPlayer,
  stones: number,
}

const players = ref<IPlayer[]>([]);
const currentPlayer = ref<IPlayer>({} as IPlayer);
const allPits = ref<IPit[]>([]);

export const useGameStore = defineStore('game', () => {
  const createBoard = (
      numberOfPlayers: number,
      numberOfPits: number,
      numberOfStartingStones: number,
  ) => {
    for (let playerIndex = 1; playerIndex <= numberOfPlayers; playerIndex++) {
      const player = {
        id: playerIndex,
        largePit: null,
        pits: [],
      } as IPlayer;

      const pitsPerSide = (numberOfPits + 1);
      const pitOffset = (playerIndex - 1) * pitsPerSide;

      for (let pitIndex = 1; pitIndex <= numberOfPits; pitIndex++) {
        const pitInstance = {
          id: pitOffset + pitIndex,
          player: player,
          isLarge: false,
          stones: numberOfStartingStones,
        } as IPit;

        player.pits.push(pitInstance);
        allPits.value.push(pitInstance);
      }
      const largePit = {
        id: pitsPerSide * playerIndex,
        player: player,
        isLarge: true,
        stones: 0,
      } as IPit;

      allPits.value.push(largePit);
      player.largePit = largePit;

      players.value.push(player);
    }
  };

  const getNextPit = (pit: IPit): number => {
    return allPits.value.length <= pit.id ? 1 : pit.id + 1;
  }

  const playStonesFromPit = (pit: IPit, firstMove = true) => {
    if ((firstMove && currentPlayer.value.id !== pit.player.id) || 0 === pit.stones) {
      return;
    }
    let stonesToDisperse = pit.stones;
    pit.stones = 0;
    let nextPit = getNextPit(pit);
    let targetPit;
    while (0 < stonesToDisperse) {
      targetPit = allPits.value[nextPit - 1];

      if (targetPit.isLarge && targetPit.player.id !== pit.player.id) {
        nextPit = getNextPit(targetPit);
        targetPit = allPits.value[nextPit];
      }

      console.debug('targetPit', targetPit.isLarge, targetPit.id,
          targetPit.stones);
      stonesToDisperse--;
      targetPit.stones++;
      nextPit = getNextPit(targetPit);
    }

    if (0 < targetPit.stones && !targetPit.isLarge) {
      playStonesFromPit(targetPit, false);
    }
  }

  const checkGameEnded = () => {
    return currentPlayer.value.pits.every(pit => 0 === pit.stones);
  }

  const turnEnded = () => {
    const nextPlayer = players.value.length === currentPlayer.value.id ? 0 : currentPlayer.value.id;
    currentPlayer.value =  players.value[nextPlayer]

    if (checkGameEnded()) {
      const winner = players.value.reduce(
          (previous, current) => (previous.largePit.stones > current.largePit.stones) ? previous : current);
      console.log(`Game ended, winner is: Player ${winner.id}`);
    }
  }

  const setCurrentPlayer = (player: IPlayer) => {
    currentPlayer.value = player;
  }

  return {
    allPits,
    players,
    createBoard,
    setCurrentPlayer,
    currentPlayer: computed(() => currentPlayer.value?.id),
    playStonesFromPit,
    turnEnded,
  };
});
