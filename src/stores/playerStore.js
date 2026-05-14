import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref(null)
  const likedSongs = ref(new Set(JSON.parse(localStorage.getItem('likedSongs') || '[]')))

  const queue = ref([])
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)

  const repeatMode = ref('none')

  let audio = null

  const progress = computed(() => {
    if (!duration.value) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  function formatTime(seconds) {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function playSong(song, songQueue = []) {
    if (audio) {
      audio.pause()
      audio.src = ''
    }

    currentSong.value = song
    queue.value = songQueue
    currentIndex.value = songQueue.findIndex(s => s.id === song.id)

    audio = new Audio(song.audio_url)
    audio.volume = volume.value

    audio.ontimeupdate = () => { currentTime.value = audio.currentTime }
    audio.onloadedmetadata = () => { duration.value = audio.duration }

    audio.onended = () => {
      if (repeatMode.value === 'one') {
        // Repetir la misma canción
        audio.currentTime = 0
        audio.play()
      } else if (repeatMode.value === 'all') {
        // Repetir toda la cola (vuelve al inicio si era la última)
        if (currentIndex.value < queue.value.length - 1) {
          playSong(queue.value[currentIndex.value + 1], queue.value)
        } else {
          playSong(queue.value[0], queue.value)
        }
      } else {
        playNext()
      }
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
    } else {
      isPlaying.value = false
    }
  }

  function playPrev() {
    if (currentIndex.value > 0) {
      playSong(queue.value[currentIndex.value - 1], queue.value)
    }
  }

  function seek(percentage) {
    if (!audio) return
    audio.currentTime = (percentage / 100) * duration.value
  }

  function setVolume(value) {
    volume.value = value
    if (audio) audio.volume = value
  }

  function toggleRepeat() {
    if (repeatMode.value === 'none') {
      repeatMode.value = 'all'
    } else if (repeatMode.value === 'all') {
      repeatMode.value = 'one'
    } else {
      repeatMode.value = 'none'
    }
  }

  const isCurrentSongLiked = computed(() => {
    return currentSong.value ? likedSongs.value.has(currentSong.value.id) : false
  })

  function toggleLike(song = currentSong.value) {
    if (!song) return
    const updated = new Set(likedSongs.value)
    if (updated.has(song.id)) {
      updated.delete(song.id)
    } else {
      updated.add(song.id)
    }
    likedSongs.value = updated
    localStorage.setItem('likedSongs', JSON.stringify([...updated]))
  }

  function isSongLiked(song) {
    return song ? likedSongs.value.has(song.id) : false
  }

  return {
    currentSong, queue, isPlaying, currentTime,
    duration, volume, progress, likedSongs, repeatMode,
    formattedCurrentTime, formattedDuration, isCurrentSongLiked,
    playSong, togglePlay, playNext, playPrev, seek, setVolume,
    toggleRepeat, toggleLike, isSongLiked
  }
})