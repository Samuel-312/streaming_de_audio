import { supabase } from '../config/supabase.js'
import { createSongSchema } from '../schemas/songSchema.js'

// OBTENER TODAS LAS CANCIONES
export const getSongs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data)

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener canciones' })
  }
}

// OBTENER UNA CANCIÓN POR ID
export const getSongById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Canción no encontrada' })
    }

    res.json(data)

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la canción' })
  }
}

// CREAR CANCIÓN (solo admin)
export const createSong = async (req, res) => {
  try {
    const validation = createSongSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.errors.map(e => e.message)
      })
    }

    const { data, error } = await supabase
      .from('songs')
      .insert(validation.data)
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)

  } catch (error) {
    res.status(500).json({ error: 'Error al crear la canción' })
  }
}

// ELIMINAR CANCIÓN (solo admin)
export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params

    const { data: existing } = await supabase
      .from('songs')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return res.status(404).json({ error: 'Canción no encontrada' })
    }

    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.status(204).send()

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la canción' })
  }
}

// AGREGAR CANCIÓN A UNA PLAYLIST
export const addSongToPlaylist = async (req, res) => {
  try {
    // Ambos IDs vienen en la URL
    // ejemplo: POST /api/playlists/123/songs/456
    const { playlistId, songId } = req.params

    // Verificamos que la playlist sea del usuario
    const { data: playlist } = await supabase
      .from('playlists')
      .select('owner_id')
      .eq('id', playlistId)
      .single()

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' })
    }

    if (playlist.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos' })
    }

    // Verificamos que la canción exista
    const { data: song } = await supabase
      .from('songs')
      .select('id')
      .eq('id', songId)
      .single()

    if (!song) {
      return res.status(404).json({ error: 'Canción no encontrada' })
    }

    // Calculamos la posición: contamos cuántas canciones tiene la playlist
    // y le sumamos 1 para que la nueva quede al final
    const { count } = await supabase
      .from('playlist_songs')
      .select('*', { count: 'exact', head: true })
      .eq('playlist_id', playlistId)

    const { data, error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: songId,
        position: (count || 0) + 1
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)

  } catch (error) {
    res.status(500).json({ error: 'Error al agregar canción a la playlist' })
  }
}

// ELIMINAR CANCIÓN DE UNA PLAYLIST
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params

    const { data: playlist } = await supabase
      .from('playlists')
      .select('owner_id')
      .eq('id', playlistId)
      .single()

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' })
    }

    if (playlist.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos' })
    }

    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId)

    if (error) throw error

    res.status(204).send()

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar canción de la playlist' })
  }
}