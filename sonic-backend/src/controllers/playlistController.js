import { supabase } from '../config/supabase.js'
import { createPlaylistSchema, updatePlaylistSchema } from '../schemas/playlistSchema.js'

// OBTENER TODAS LAS PLAYLISTS PÚBLICAS
export const getPlaylists = async (req, res) => {
  try {
    // Traemos todas las playlists que sean públicas
    // .select('*, users(username)') → trae todos los campos de playlist
    // y además el username del usuario dueño (join automático por owner_id)
    const { data, error } = await supabase
      .from('playlists')
      .select('*, users(username)')
      .eq('is_public', true)
      .order('created_at', { ascending: false }) // Las más nuevas primero

    if (error) throw error

    res.json(data)

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener playlists' })
  }
}

// OBTENER UNA PLAYLIST POR ID (con sus canciones)
export const getPlaylistById = async (req, res) => {
  try {
    // req.params.id contiene el id que viene en la URL
    // ejemplo: GET /api/playlists/123 → req.params.id = "123"
    const { id } = req.params

    // Traemos la playlist con sus canciones
    // playlist_songs es la tabla intermedia, y dentro songs son los datos reales
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

// CREAR PLAYLIST
export const createPlaylist = async (req, res) => {
  try {
    const validation = createPlaylistSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.errors.map(e => e.message)
      })
    }

    const { title, description, is_public } = validation.data

    // req.user.id viene del middleware verifyToken
    // así sabemos quién está creando la playlist sin que lo manden en el body
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        title,
        description,
        is_public,
        owner_id: req.user.id  // El dueño es el usuario autenticado
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)

  } catch (error) {
    res.status(500).json({ error: 'Error al crear la playlist' })
  }
}

// ACTUALIZAR PLAYLIST
export const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params

    const validation = updatePlaylistSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.errors.map(e => e.message)
      })
    }

    // Verificamos que la playlist exista y pertenezca al usuario
    const { data: existing } = await supabase
      .from('playlists')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return res.status(404).json({ error: 'Playlist no encontrada' })
    }

    // Solo el dueño o un admin puede editar la playlist
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

// ELIMINAR PLAYLIST
export const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params

    // Verificamos que exista y sea del usuario
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

    // ON DELETE CASCADE en la BD se encarga de borrar también
    // los registros relacionados en playlist_songs automáticamente
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id)

    if (error) throw error

    // 204 significa "éxito pero sin contenido que devolver"
    res.status(204).send()

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la playlist' })
  }
}