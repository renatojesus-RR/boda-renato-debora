'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Users, CheckCircle2, Clock, Music, Search, RefreshCw, Phone, Disc, Link as LinkIcon, ShieldAlert, MessageCircle, UserPlus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import settings from '../config/settings';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Estados de Datos
  const [rsvps, setRsvps] = useState([]);
  const [songRequests, setSongRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtros y Pestañas
  const [activeTab, setActiveTab] = useState('rsvps'); // 'rsvps' | 'songs'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'confirmed' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para controlar el modal / formulario de nuevo invitado
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestTable, setNewGuestTable] = useState('');

  const handleCreateGuest = async (e) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pinInput,
          action: 'add_guest',
          guestData: {
            nombre: newGuestName,
            telefono: newGuestPhone,
            numero_mesa: newGuestTable
          }
        }),
      });

      const result = await res.json();
      if (res.ok && result.newGuest) {
        setRsvps(prev => [...prev, result.newGuest].sort((a,b) => a.nombre_invitado.localeCompare(b.nombre_invitado)));
        setShowAddModal(false);
        setNewGuestName('');
        setNewGuestPhone('');
        setNewGuestTable('');
      } else {
        alert(result.error || 'No se pudo crear el invitado');
      }
    } catch (err) {
      alert('Error de red al crear el invitado');
    } finally {
      setLoading(false);
    }
  };

  // 1. Manejo del Login por PIN
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPinError(false);

    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });

      const result = await res.json();

      if (res.ok) {
        setRsvps(result.rsvps || []);
        setSongRequests(result.songRequests || []);
        setIsAuthenticated(true);
      } else {
        setPinError(true);
        setPinInput('');
      }
    } catch (err) {
      setPinError(true);
    } finally {
      setLoading(false);
    }
  };

  // 2. Cargar Datos desde Supabase
  const fetchData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const result = await res.json();
      if (res.ok) {
        setRsvps(result.rsvps || []);
        setSongRequests(result.songRequests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Métricas calculadas
  const totalGuests = rsvps.length;
  const confirmedGuests = rsvps.filter(r => r.asistira).length;
  const pendingGuests = totalGuests - confirmedGuests;
  const totalSongs = songRequests.length;

  // Filtrado de RSVPs
  const filteredRsvps = rsvps.filter(item => {
    const matchesSearch = item.nombre_invitado?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.telefono?.includes(searchQuery);
    
    if (statusFilter === 'confirmed') return matchesSearch && item.asistira;
    if (statusFilter === 'pending') return matchesSearch && !item.asistira;
    return matchesSearch;
  });

  // Limpiar paréntesis para vista estética del admin
  const cleanName = (str) => {
    if (!str) return '';
    return str.replace(/\([^)]*\)/g, '').trim();
  };

  const buildWhatsappUrl = (phone, rawName, asistira) => {
    if (!phone) return null;
    
    const cleanNum = phone.replace(/\D/g, '');
    const fullPhone = cleanNum.length === 9 ? `51${cleanNum}` : cleanNum;
    
    const name = cleanName(rawName);
    const siteUrl = "https://bodarenatoydebora.vercel.app";

    let message = "";
    if (asistira) {
      message = `¡Hola ${name}! 💍 Te compartimos el enlace a la web de nuestra boda para que consultes tu pase VIP con código QR o veas la ubicación del evento: ${siteUrl} ¡Esperamos verte pronto! - Renato & Débora`;
    } else {
      message = `¡Hola ${name}! ✨ Te compartimos con mucho cariño la invitación a nuestra boda: ${siteUrl}. Les agradeceremos confirmar su asistencia a través del enlace cuando puedan. ¡Un fuerte abrazo! - Renato & Débora`;
    }

    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
  };

  // Agregar estados para edición de teléfono en AdminDashboard:
  const [editingId, setEditingId] = useState(null);
  const [tempPhone, setTempPhone] = useState('');

  // Función para guardar teléfono rápido desde Admin:
  const handleSavePhone = async (id) => {
    if (!tempPhone.trim() || tempPhone.trim().length < 9) return;
  
    const cleanNum = tempPhone.replace(/\D/g, '');
    const { error } = await supabase
      .from('rsvps')
      .update({ telefono: cleanNum })
      .eq('id', id);

    if (!error) {
      setRsvps(prev => prev.map(item => item.id === id ? { ...item, telefono: cleanNum } : item));
      setEditingId(null);
      setTempPhone('');
    }
  };

  // VISTA 1: PANTALLA DE LOGIN POR PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 bg-[#722F37]/20 border border-[#722F37]/50 rounded-full flex items-center justify-center mx-auto text-[#d4af37]">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="font-playfair text-2xl text-white">Panel de Control</h1>
            <p className="text-xs text-[#d4af37] uppercase tracking-widest mt-1">Boda Renato & Debora</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingresa el PIN de 4 dígitos"
                className="w-full text-center py-3.5 text-lg font-mono tracking-widest bg-black/60 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-400 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> PIN incorrecto. Intenta de nuevo.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#722F37] hover:bg-[#8b3843] text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-all border border-[#722F37]"
            >
              Ingresar
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // VISTA 2: DASHBOARD PRINCIPAL
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 relative">
      
      {/* Cabecera Admin */}
      <header className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-xl md:text-2xl text-white font-medium">Control de Invitados</h1>
            <p className="text-[10px] text-[#d4af37] uppercase tracking-widest">Renato & Debora</p>
          </div>

          <div className="flex items-center gap-2">
            {/* 🟢 BOTÓN PARA ABRIR EL MODAL DE AGREGAR INVITADO */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 bg-[#722F37] hover:bg-[#8b3843] border border-[#722F37] rounded-xl text-white transition-all flex items-center gap-1.5 text-xs font-semibold shadow-lg"
            >
              <UserPlus className="w-4 h-4 text-[#d4af37]" />
              <span>+ Nuevo Invitado</span>
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[#d4af37] transition-all flex items-center gap-2 text-xs"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">

        {/* Tarjetas de Métricas KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#faf8f3]/50 uppercase tracking-wider">Total Lista</p>
              <p className="text-2xl font-bold text-white">{totalGuests}</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#faf8f3]/50 uppercase tracking-wider">Confirmados</p>
              <p className="text-2xl font-bold text-emerald-400">{confirmedGuests}</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#faf8f3]/50 uppercase tracking-wider">Pendientes</p>
              <p className="text-2xl font-bold text-amber-400">{pendingGuests}</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#faf8f3]/50 uppercase tracking-wider">Canciones</p>
              <p className="text-2xl font-bold text-purple-400">{totalSongs}</p>
            </div>
          </div>

        </div>

        {/* NAVEGACIÓN ENTRE SECCIONES */}
        <div className="flex border-b border-white/10 gap-6 text-sm">
          <button
            onClick={() => setActiveTab('rsvps')}
            className={`pb-3 font-medium transition-all relative ${
              activeTab === 'rsvps' ? 'text-[#d4af37]' : 'text-white/50 hover:text-white'
            }`}
          >
            Lista de Asistencia RSVP ({rsvps.length})
            {activeTab === 'rsvps' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('songs')}
            className={`pb-3 font-medium transition-all relative ${
              activeTab === 'songs' ? 'text-[#d4af37]' : 'text-white/50 hover:text-white'
            }`}
          >
            Sugerencias DJ ({songRequests.length})
            {activeTab === 'songs' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]" />
            )}
          </button>
        </div>

        {/* CONTENIDO 1: LISTA DE RSVPs */}
        {activeTab === 'rsvps' && (
          <div className="space-y-4">
            
            {/* Buscador y Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o cel..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`flex-1 sm:px-4 py-1.5 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-[#d4af37] text-black font-semibold' : 'text-white/60'}`}
                >
                  Todos ({totalGuests})
                </button>
                <button
                  onClick={() => setStatusFilter('confirmed')}
                  className={`flex-1 sm:px-4 py-1.5 rounded-lg transition-all ${statusFilter === 'confirmed' ? 'bg-emerald-500 text-black font-semibold' : 'text-white/60'}`}
                >
                  Confirmados ({confirmedGuests})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`flex-1 sm:px-4 py-1.5 rounded-lg transition-all ${statusFilter === 'pending' ? 'bg-amber-500 text-black font-semibold' : 'text-white/60'}`}
                >
                  Pendientes ({pendingGuests})
                </button>
              </div>

            </div>

            {/* Tabla / Tarjetas de Invitados */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/5">
                {filteredRsvps.length === 0 ? (
                  <div className="p-8 text-center text-xs text-white/40">
                    No se encontraron invitados con los filtros aplicados.
                  </div>
                ) : (
                  filteredRsvps.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {cleanName(item.nombre_invitado)}
                          {item.nombre_invitado.includes('(') && (
                            <span className="text-[10px] text-white/40 ml-2 italic">
                              {item.nombre_invitado.match(/\(([^)]+)\)/)?.[0]}
                            </span>
                          )}
                        </p>

                        {/* Sección de Teléfono / Edición rápida */}
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="tel"
                                value={tempPhone}
                                onChange={(e) => setTempPhone(e.target.value)}
                                placeholder="Ej. 987654321"
                                className="px-2 py-1 bg-black border border-[#d4af37] text-white text-xs rounded-lg outline-none w-32 font-mono"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSavePhone(item.id)}
                                className="px-2 py-1 bg-emerald-500 text-black font-semibold text-[10px] rounded-lg"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 bg-white/10 text-white/60 text-[10px] rounded-lg"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : item.telefono ? (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-emerald-400/90 font-mono">
                                <Phone className="w-3 h-3" /> {item.telefono}
                              </span>
                              <button 
                                onClick={() => { setEditingId(item.id); setTempPhone(item.telefono); }}
                                className="text-[10px] text-white/30 hover:text-[#d4af37] underline ml-1"
                              >
                                Editar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingId(item.id); setTempPhone(''); }}
                              className="text-[10px] text-[#d4af37] hover:underline flex items-center gap-1"
                            >
                              + Agregar Celular
                            </button>
                          )}

                          {item.numero_mesa && (
                            <span className="text-[#d4af37] ml-2">
                              Mesa: {item.numero_mesa}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 🟢 BOTÓN WHATSAPP 1-CLICK */}
                        {item.telefono && (
                          <a
                            href={buildWhatsappUrl(item.telefono, item.nombre_invitado, item.asistira)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium"
                            title="Enviar mensaje personalizado por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Enviar WA</span>
                          </a>
                        )}

                        {/* ETIQUETA DE ESTADO */}
                        {item.asistira ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Confirmado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                            <Clock className="w-3 h-3" /> Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* CONTENIDO 2: CANCIONES SUGERIDAS */}
        {activeTab === 'songs' && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
              {songRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-white/40">
                  Aún no hay recomendaciones de canciones.
                </div>
              ) : (
                songRequests.map((song) => (
                  <div key={song.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#d4af37]/10 text-[#d4af37] rounded-xl shrink-0">
                        <Disc className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{song.cancion || 'Ver Enlace'}</p>
                        <p className="text-xs text-[#d4af37]">{song.artista || 'Artista no especificado'}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">Sugerido por: {song.nombre_invitado || 'Anónimo'}</p>
                      </div>
                    </div>

                    {song.link && (
                      <a
                        href={song.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/5 hover:bg-[#d4af37]/20 border border-white/10 text-[#d4af37] rounded-lg transition-colors shrink-0"
                        title="Escuchar tema"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* 🔴 MODAL PARA AGREGAR NUEVO INVITADO */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121212] border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-playfair text-white">Agregar Nuevo Invitado</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-white/40 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGuest} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#d4af37] uppercase tracking-wider mb-1 font-semibold">
                    Nombre Completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Ej. Juan Carlos Pérez"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#d4af37] uppercase tracking-wider mb-1 font-semibold">
                    Número de Celular (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    placeholder="Ej. 987654321"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#d4af37] uppercase tracking-wider mb-1 font-semibold">
                    Número de Mesa (Opcional)
                  </label>
                  <input
                    type="number"
                    value={newGuestTable}
                    onChange={(e) => setNewGuestTable(e.target.value)}
                    placeholder="Ej. 5"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium border border-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-[#722F37] hover:bg-[#8b3843] text-white font-semibold rounded-xl border border-[#722F37] flex items-center justify-center gap-2"
                  >
                    {loading ? 'Guardando...' : 'Guardar Invitado'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}