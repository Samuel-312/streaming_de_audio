import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // La canción que está sonando actualmente
  const currentSong = ref(null)

  // Lista de canciones de la playlist actual
  const queue = ref([])

  // Índice de la canción actual en la queue
  const currentIndex = ref(0)

  // Estado del reproductor
  const isPlaying = ref(false)
  const currentTime = ref(0)   // Segundos transcurridos
  const duration = ref(0)      // Duración total en segundos
  const volume = ref(1)        // Volumen de 0 a 1

  // El objeto Audio de HTML5 que maneja el audio real
  // lo guardamos fuera del estado reactivo para no causar problemas
  let audio = null

  // Getters
  // Calcula el progreso como porcentaje para la barra
  const progress = computed(() => {
    if (!duration.value) return 0
    return (currentTime.value / duration.value) * 100
  })

  // Formatea segundos a mm:ss (ejemplo: 222 → "3:42")
  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  function formatTime(seconds) {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Carga y reproduce una canción
  function playSong(song, songQueue = []) {
    // Si hay un audio previo, lo detenemos y limpiamos sus eventos
    if (audio) {
      audio.pause()
      audio.src = ''
    }

    currentSong.value = song
    queue.value = songQueue

    // Encontramos el índice de la canción en la queue
    currentIndex.value = songQueue.findIndex(s => s.id === song.id)

    // Creamos un nuevo objeto Audio con la URL del archivo
    audio = new Audio(song.audio_url)
    audio.volume = volume.value

    // Eventos del audio
    // ontimeupdate se dispara constantemente mientras suena
    audio.ontimeupdate = () => {
      currentTime.value = audio.currentTime
    }

    // onloadedmetadata se dispara cuando el audio cargó su información
    audio.onloadedmetadata = () => {
      duration.value = audio.duration
    }

    // onended se dispara cuando termina la canción
    audio.onended = () => {
      playNext()
    }

    audio.play()
    isPlaying.value = true
  }

  function togglePlay() {
    if (!audio) return

    if (isPlaying.value) {
      audio.pause()
    } else {
      audio.play()
    }

    isPlaying.value = !isPlaying.value
  }

  function playNext() {
    if (currentIndex.value < queue.value.length - 1) {
      playSong(queue.value[currentIndex.value + 1], queue.value)
    }
  }

  function playPrev() {
    if (currentIndex.value > 0) {
      playSong(queue.value[currentIndex.value - 1], queue.value)
    }
  }

  // Permite saltar a un punto específico de la canción
  function seek(percentage) {
    if (!audio) return
    audio.currentTime = (percentage / 100) * duration.value
  }

  // Cambia el volumen
  function setVolume(value) {
    volume.value = value
    if (audio) audio.volume = value
  }

  return {
    currentSong, queue, isPlaying, currentTime,
    duration, volume, progress,
    formattedCurrentTime, formattedDuration,
    playSong, togglePlay, playNext, playPrev, seek, setVolume
  }
})