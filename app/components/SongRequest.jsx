'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Send, Check, AlertCircle, Plus, Trash2, Disc, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import settings from '../config/settings';

export default function SongRequest() {
  const [isActive, setIsActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [nombre, setNombre] = useState('');
  const [songs, setSongs] = useState([
    { id: 1, cancion: '', artista: '', link: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setMounted(true);

    const checkActivation = async () => {
      // 1. Verificación en modo prueba manual o deshabilitado estático
      if (!settings.songRequest?.enabled) return;
      if (settings.songRequest?.forceShow) {
        setIsActive(true);
        return;
      }

      // 2. Verificación dinámica desde la tabla app_config en Supabase
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('songs_unlocked')
          .eq('id', 1)
          .single();

        if (!error && data?.songs_unlocked) {
          setIsActive(true);
          return;
        }
      } catch (err) {
        console.error("No se pudo consultar app_config, evaluando regla de fecha...", err);
      }

      // 3. Fallback automático por ventana de tiempo (24h antes del evento)
      try {
        const weddingTime = new Date(`${settings.wedding.date}T${settings.wedding.ceremony.time}:00`).getTime();
        const activeStart = weddingTime - (24 * 60 * 60 * 1000);
        const activeEnd = weddingTime + (18 * 60 * 60 * 1000);
        const now = new Date().getTime();

        if (now >= activeStart && now <= activeEnd) {
          setIsActive(true);
        }
      } catch (e) {
        setIsActive(false);
      }
    };

    checkActivation();
  }, []);

  if (!mounted || !isActive) return null;

  const handleAddSong = () => {
    if (songs.length < 5) {
      setSongs([...songs, { id: Date.now(), cancion: '', artista: '', link: '' }]);
    }
  };

  const handleRemoveSong = (id) => {
    if (songs.length > 1) {
      setSongs(songs.filter(song => song.id !== id));
    }
  };

  const handleSongChange = (id, field, value) => {
    setSongs(songs.map(song => 
      song.id === id ? { ...song, [field]: value } : song
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const validSongs = songs.filter(s => s.cancion.trim() !== '' || s.link.trim() !== '');

    if (validSongs.length === 0) {
      setErrorMsg('Por favor, ingresa al menos una canción o enlace.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = validSongs.map(s => ({
        nombre_invitado: nombre.trim() || 'Anónimo',
        cancion: s.cancion.trim() || 'Ver Link',
        artista: s.artista.trim() || 'Desconocido',
        link: s.link.trim() || null
      }));

      const { error } = await supabase
        .from('song_requests')
        .insert(payload);

      if (error) {
        setErrorMsg('Hubo un problema al guardar tus sugerencias.');
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setErrorMsg('Error de conexión inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="song-request" className="py-28 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.06)_0%,_transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* Cabecera */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[0.5px] w-12 bg-gradient-to-r from-transparent to-[#d4af37]" />
            <Music className="w-5 h-5 text-[#d4af37]" />
            <div className="h-[0.5px] w-12 bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>

          <h2 className="font-playfair text-4xl md:text-5xl text-white font-thin mb-3 tracking-wide">
            {settings.songRequest.title}
          </h2>
          <p className="text-xs uppercase tracking-[3px] text-[#d4af37] font-medium mb-4">
            {settings.songRequest.subtitle}
          </p>
          <p className="text-[#faf8f3]/70 font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed italic">
            "{settings.songRequest.message}"
          </p>
        </motion.div>

        {/* Tarjeta del Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
            <Disc className="w-48 h-48 text-white animate-spin-slow" />
          </div>

          {submitted ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="w-16 h-16 bg-[#d4af37]/20 border border-[#d4af37]/40 rounded-full flex items-center justify-center mx-auto text-[#d4af37]">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-playfair text-2xl text-white">¡Canciones Guardadas!</h3>
              <p className="text-sm text-[#faf8f3]/70 font-light">
                Muchas gracias por ayudarnos a armar la fiesta.
              </p>
              <button
                onClick={() => { setSubmitted(false); setSongs([{ id: Date.now(), cancion: '', artista: '', link: '' }]); }}
                className="text-xs uppercase tracking-widest text-[#d4af37] hover:text-white transition-colors underline pt-2 block mx-auto"
              >
                Sugerir más canciones
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              
              {/* Nombre (OPCIONAL) */}
              <div>
                <label className="block text-xs font-semibold text-[#d4af37] mb-2 uppercase tracking-widest">
                  Tu Nombre <span className="text-[#faf8f3]/40 font-normal lowercase">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a]/80 border border-white/10 text-white rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none text-sm"
                  placeholder="Ej. Tío Carlos / Anónimo"
                />
              </div>

              {/* Lista de Canciones */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-semibold text-[#d4af37] uppercase tracking-widest">
                  Canciones Recomendadas
                </label>

                <AnimatePresence initial={false}>
                  {songs.map((song, index) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 bg-[#1a1a1a]/60 border border-white/10 rounded-2xl space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-medium">
                          Tema #{index + 1}
                        </span>
                        {songs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSong(song.id)}
                            className="text-red-400/60 hover:text-red-400 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={song.cancion}
                          onChange={(e) => handleSongChange(song.id, 'cancion', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 text-white rounded-lg focus:border-[#d4af37] transition-all outline-none text-sm"
                          placeholder="Nombre de la Canción"
                        />
                        <input
                          type="text"
                          value={song.artista}
                          onChange={(e) => handleSongChange(song.id, 'artista', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 text-white rounded-lg focus:border-[#d4af37] transition-all outline-none text-sm"
                          placeholder="Artista / Banda"
                        />
                      </div>

                      <div className="flex items-center gap-2 bg-black/20 border border-white/5 px-3 py-1.5 rounded-lg">
                        <LinkIcon className="w-3.5 h-3.5 text-[#d4af37]/70 shrink-0" />
                        <input
                          type="url"
                          value={song.link}
                          onChange={(e) => handleSongChange(song.id, 'link', e.target.value)}
                          className="w-full bg-transparent text-white/80 transition-all outline-none text-xs"
                          placeholder="Link de Spotify o YouTube (Opcional)"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {songs.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddSong}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs text-[#d4af37] rounded-xl flex items-center justify-center gap-2 transition-all font-medium uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar otra canción
                  </button>
                )}
              </div>

              {/* Mensaje de Error */}
              {errorMsg && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </p>
              )}

              {/* Botón Enviar */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-2 bg-[#722F37] hover:bg-[#8b3843] text-white font-semibold tracking-[2px] uppercase rounded-xl transition-all duration-300 border border-[#722F37] hover:border-[#d4af37]/50 shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#d4af37]" />
                    Enviar Sugerencias
                  </>
                )}
              </motion.button>

            </form>
          )}

        </motion.div>

      </div>
    </section>
  );
}