import { supabase } from '../config/supabase.js'
import { createPlaylistSchema, updatePlaylistSchema } from '../schemas/playlistSchema.js'

export const getPlaylists = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select('*, users(username)')
      .eq('is_public', true)
      .order('created_at', { ascending: false }) 

    if (error) throw error

    res.json(data)

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener playlists' })
  }
}

export const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        users(username),
        playlist_songs(
          position,
          songs(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Playlist no encontrada' })
    }

    res.json(data)

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la playlist' })
  }
}

export const createPlaylist = async (req, res) => {
  try {
    const validation = createPlaylistSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({error: validation.error.errors.map(e => e.message)})
    }

    const { title, description, is_public } = validation.data

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        title,
        description,
        is_public,
        owner_id: req.user.id  
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)

  } catch (error) {
    res.status(500).json({ error: 'Error al crear la playlist' })
  }
}

export const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params

    const validation = updatePlaylistSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.errors.map(e => e.message)
      })
    }

    const { data: existing } = await supabase
      .from('playlists')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return res.status(404).json({ error: 'Playlist no encontrada' })
    }

    if (existing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos' })
    }

    const { data, error } = await supabase
      .from('playlists')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json(data)

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la playlist' })
  }
}

export const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params

    const { data: existing } = await supabase
      .from('playlists')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return res.status(404).json({ error: 'Playlist no encontrada' })
    }

    if (existing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos' })
    }
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.status(204).send()

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la playlist' })
  }
}