<template>
  <!-- Solo se muestra si hay una canción cargada -->
  <div v-if="playerStore.currentSong" class="player">

    <!-- Info de la canción -->
    <div class="player-info">
      <img :src="playerStore.currentSong.cover_url || 'https://picsum.photos/50'" class="player-cover"/>

      <div class="player-meta">
        <span class="player-title">{{ playerStore.currentSong.title }}</span>
        <span class="player-artist">{{ playerStore.currentSong.artist }}</span>
      </div>
    </div>

    <!-- Controles centrales -->
    <div class="player-controls">
      <div class="player-buttons">
        <!-- Botón anterior -->
        <button @click="playerStore.playPrev()" class="ctrl-btn">⏮</button>

        <!-- Botón play/pause -->
        <button @click="playerStore.togglePlay()" class="ctrl-btn play-btn">
          {{ playerStore.isPlaying ? '⏸' : '▶' }}
        </button>

        <!-- Botón siguiente -->
        <button @click="playerStore.playNext()" class="ctrl-btn">⏭</button>
      </div>

      <!-- Barra de progreso -->
      <div class="player-progress">
        <span class="time">{{ playerStore.formattedCurrentTime }}</span>
        <div class="progress-bar" @click="handleSeek">
          <div
            class="progress-fill"
            :style="{ width: playerStore.progress + '%' }"
          ></div>
        </div>
        <span class="time">{{ playerStore.formattedDuration }}</span>
      </div>
    </div>

    <!-- Control de volumen -->
    <div class="player-volume">
      <span>🔊</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="playerStore.volume"
        @input="playerStore.setVolume(Number($event.target.value))"
        class="volume-slider"
      />
    </div>

  </div>
</template>

<script setup>
import { usePlayerStore } from '../stores/playerStore'

const playerStore = usePlayerStore()

// Calcula en qué porcentaje de la barra hizo clic el usuario
function handleSeek(event) {
  const bar = event.currentTarget
  const clickX = event.offsetX
  const percentage = (clickX / bar.offsetWidth) * 100
  playerStore.seek(percentage)
}
</script>

<style scoped>
.player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: #1a1a1a;
  border-top: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 250px;
}

.player-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.player-meta {
  display: flex;
  flex-direction: column;
}

.player-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.player-artist {
  color: #888;
  font-size: 12px;
}

.player-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 500px;
}

.player-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ctrl-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s;
}

.ctrl-btn:hover {
  color: #ffffff;
}

.play-btn {
  background-color: #a855f7;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 14px;
}

.player-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.time {
  color: #888;
  font-size: 11px;
  min-width: 35px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: #2a2a2a;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background-color: #a855f7;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.player-volume {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 150px;
  justify-content: flex-end;
}

.volume-slider {
  width: 80px;
  accent-color: #a855f7;
  cursor: pointer;
}
</style>