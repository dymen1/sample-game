<script lang="ts" setup>
import {IPit} from '../stores/types';

export interface PitProps {
  pit: IPit;
}

const props = defineProps<PitProps>();
</script>

<template>
  <div class="pit">
    <strong>{{ pit.id }} :: Stones </strong>
    <br/>
    <cite>
      {{ pit.stones }}
    </cite>
  </div>
</template>

<style scoped>
.pit {
  padding: 1rem;
  border: 1px solid papayawhip;
}
</style>
