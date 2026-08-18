'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Users, CheckCircle2, Clock, Music, Search, RefreshCw, Phone, Disc, Link as LinkIcon, ShieldAlert, MessageCircle, UserPlus, X, Edit3, Trash2, Check, UserCheck } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('rsvps');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Nuevo Invitado
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestTable, setNewGuestTable] = useState('');

  // Edición Inline
  const [editingPhoneId, setEditingPhoneId] = useState(null);
  const [tempPhone, setTempPhone] = useState('');

  const [editingNameId, setEditingNameId] = useState(null);
  const [tempName, setTempName] = useState('');

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

  // 2. Cargar / Refrescar Datos
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

  // 3. Crear Invitado
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

  // 4. Editar Nombre
  const handleSaveName = async (id) => {
    if (!tempName.trim() || tempName.trim().length < 3) return;

    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pinInput,
          action: 'edit_guest_name',
          guestId: id,
          guestData: { nombre: tempName }
        }),
      });

      const result = await res.json();
      if (res.ok && result.updatedGuest) {
        setRsvps(prev => prev.map(item => item.id === id ? { ...item, nombre_invitado: tempName.trim() } : item));
        setEditingNameId(null);
        setTempName('');
      } else {
        alert(result.error || 'No se pudo actualizar el nombre');
      }
    } catch (err) {
      alert('Error de red al actualizar nombre');
    }
  };

  // 5. Eliminar Invitado
  const handleDeleteGuest = async (id, nombre) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar a "${nombre}" de la lista de invitados? Esta acción no se puede deshacer.`);
    if (!confirmDelete) return;

    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pinInput,
          action: 'delete_guest',
          guestId: id
        }),
      });

      const result = await res.json();
      if (res.ok && result.deletedId) {
        setRsvps(prev => prev.filter(item => item.id !== id));
      } else {
        alert(result.error || 'No se pudo eliminar el invitado');
      }
    } catch (err) {
      alert('Error de red al eliminar invitado');
    }
  };

  // 6. Editar Teléfono
  const handleSavePhone = async (id) => {
    if (!tempPhone.trim() || tempPhone.trim().length < 9) return;
  
    const cleanNum = tempPhone.replace(/\D/g, '');
    const { error } = await supabase
      .from('rsvps')
      .update({ telefono: cleanNum })
      .eq('id', id);

    if (!error) {
      setRsvps(prev => prev.map(item => item.id === id ? { ...item, telefono: cleanNum } : item));
      setEditingPhoneId(null);
      setTempPhone('');
    }
  };

  // Métricas calculadas actualizadas
  const totalGuests = rsvps.length;
  const confirmedGuests = rsvps.filter(r => r.asistira).length;
  const pendingGuests = totalGuests - confirmedGuests;
  const totalSongs = songRequests.length;
  // Nueva métrica: Quienes ya pasaron por el escáner de la puerta
  const checkedInGuests = rsvps.filter(r => r.ingreso_confirmado).length;

  // Filtrado de RSVPs
  const filteredRsvps = rsvps.filter(item => {
    const matchesSearch = item.nombre_invitado?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.telefono?.includes(searchQuery);
    
    if (statusFilter === 'confirmed') return matchesSearch && item.asistira;
    if (statusFilter === 'pending') return matchesSearch && !item.asistira;
    return matchesSearch;
  });

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

    let message = asistira
      ? `¡Hola ${name}! 💍 Te compartimos el enlace a la web de nuestra boda para que consultes tu pase VIP con código QR o veas la ubicación del evento: ${siteUrl} ¡Esperamos verte pronto! - Renato & Débora`
      : `¡Hola ${name}! ✨ Te compartimos con mucho cariño la invitación a nuestra boda: ${siteUrl}. Les agradeceremos confirmar su asistencia a través del enlace cuando puedan. ¡Un fuerte abrazo! - Renato & Débora`;

    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
  };

  // LOGIN POR PIN
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
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 bg-[#722F37] hover:bg-[#8b3843] border border-[#722F37] rounded-xl text-white transition-all flex items-center gap-1.5 text-xs font-semibold shadow-lg"
            >
              <UserPlus className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden sm:inline">+ Nuevo Invitado</span>
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

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Users className="w-5 h-5" /></div>
            <div><p className="text-[10px] text-[#faf8f3]/50 uppercase tracking-wider">Total Lista</p><p className="text-2xl font-bold text-white">{totalGuests}</p></div>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-[#faf8f3]/50 uppercase tracking-wider">Confirmados</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-emerald-400">{confirmedGuests}</p>
                {/* Nuevo indicador numérico de cuántos ya ingresaron */}
                {checkedInGuests > 0 && (
                  <p className="text-[10px] font-medium text-blue-400">({checkedInGuests} en salón)</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><Clock className="w-5 h-5" /></div>
            <div><p className="text-[10px] text-[#faf8f3]/50 uppercase tracking-wider">Pendientes</p><p className="text-2xl font-bold text-amber-400">{pendingGuests}</p></div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Music className="w-5 h-5" /></div>
            <div><p className="text-[10px] text-[#faf8f3]/50 uppercase tracking-wider">Canciones</p><p className="text-2xl font-bold text-purple-400">{totalSongs}</p></div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-white/10 gap-6 text-sm">
          <button onClick={() => setActiveTab('rsvps')} className={`pb-3 font-medium transition-all relative ${activeTab === 'rsvps' ? 'text-[#d4af37]' : 'text-white/50 hover:text-white'}`}>
            Lista de Asistencia RSVP ({rsvps.length})
            {activeTab === 'rsvps' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]" />}
          </button>
          <button onClick={() => setActiveTab('songs')} className={`pb-3 font-medium transition-all relative ${activeTab === 'songs' ? 'text-[#d4af37]' : 'text-white/50 hover:text-white'}`}>
            Sugerencias DJ ({songRequests.length})
            {activeTab === 'songs' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]" />}
          </button>
        </div>

        {/* LISTA RSVPs */}
        {activeTab === 'rsvps' && (
          <div className="space-y-4">
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

              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs w-full sm:w-auto overflow-x-auto">
                <button onClick={() => setStatusFilter('all')} className={`whitespace-nowrap flex-1 px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-[#d4af37] text-black font-semibold' : 'text-white/60'}`}>Todos ({totalGuests})</button>
                <button onClick={() => setStatusFilter('confirmed')} className={`whitespace-nowrap flex-1 px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'confirmed' ? 'bg-emerald-500 text-black font-semibold' : 'text-white/60'}`}>Confirmados ({confirmedGuests})</button>
                <button onClick={() => setStatusFilter('pending')} className={`whitespace-nowrap flex-1 px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'pending' ? 'bg-amber-500 text-black font-semibold' : 'text-white/60'}`}>Pendientes ({pendingGuests})</button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/5">
                {filteredRsvps.length === 0 ? (
                  <div className="p-8 text-center text-xs text-white/40">No se encontraron invitados.</div>
                ) : (
                  filteredRsvps.map((item) => (
                    <div key={item.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${item.ingreso_confirmado ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-white/[0.02]'}`}>
                      
                      {/* INFORMACIÓN DEL INVITADO & EDICIÓN DE NOMBRE */}
                      <div className="space-y-1">
                        {editingNameId === item.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              className="px-2 py-1 bg-black border border-[#d4af37] text-white text-xs rounded-lg outline-none w-52"
                              autoFocus
                            />
                            <button onClick={() => handleSaveName(item.id)} className="p-1 bg-emerald-500 text-black rounded-lg" title="Guardar"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditingNameId(null)} className="p-1 bg-white/10 text-white/60 rounded-lg" title="Cancelar"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">
                              {cleanName(item.nombre_invitado)}
                              {item.nombre_invitado.includes('(') && (
                                <span className="text-[10px] text-white/40 ml-2 italic">
                                  {item.nombre_invitado.match(/\(([^)]+)\)/)?.[0]}
                                </span>
                              )}
                            </p>
                            <button
                              onClick={() => { setEditingNameId(item.id); setTempName(item.nombre_invitado); }}
                              className="text-white/30 hover:text-[#d4af37] transition-colors p-1"
                              title="Editar Nombre"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* EDICIÓN DE TELÉFONO */}
                        <div className="flex items-center gap-2 text-xs">
                          {editingPhoneId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="tel"
                                value={tempPhone}
                                onChange={(e) => setTempPhone(e.target.value)}
                                placeholder="Ej. 987654321"
                                className="px-2 py-1 bg-black border border-[#d4af37] text-white text-xs rounded-lg outline-none w-32 font-mono"
                                autoFocus
                              />
                              <button onClick={() => handleSavePhone(item.id)} className="px-2 py-1 bg-emerald-500 text-black font-semibold text-[10px] rounded-lg">Guardar</button>
                              <button onClick={() => setEditingPhoneId(null)} className="px-2 py-1 bg-white/10 text-white/60 text-[10px] rounded-lg">Cancelar</button>
                            </div>
                          ) : item.telefono ? (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-emerald-400/90 font-mono">
                                <Phone className="w-3 h-3" /> {item.telefono}
                              </span>
                              <button onClick={() => { setEditingPhoneId(item.id); setTempPhone(item.telefono); }} className="text-[10px] text-white/30 hover:text-[#d4af37] underline ml-1">Editar Cel</button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditingPhoneId(item.id); setTempPhone(''); }} className="text-[10px] text-[#d4af37] hover:underline">+ Agregar Celular</button>
                          )}

                          {item.numero_mesa && <span className="text-[#d4af37] ml-2 font-medium">Mesa: {item.numero_mesa}</span>}
                        </div>
                      </div>

                      {/* ACCIONES Y ESTADO DINÁMICO */}
                      <div className="flex flex-wrap items-center gap-2">
                        {item.telefono && (
                          <a
                            href={buildWhatsappUrl(item.telefono, item.nombre_invitado, item.asistira)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Enviar WA</span>
                          </a>
                        )}

                        {/* 🔴 NUEVA LÓGICA DE ETIQUETA VISUAL */}
                        {item.ingreso_confirmado ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                            <UserCheck className="w-3 h-3" /> En Salón
                          </span>
                        ) : item.asistira ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Confirmado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                            <Clock className="w-3 h-3" /> Pendiente
                          </span>
                        )}

                        {/* BOTÓN ELIMINAR INVITADO */}
                        <button
                          onClick={() => handleDeleteGuest(item.id, cleanName(item.nombre_invitado))}
                          className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                          title="Eliminar de la lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* CANCIONES */}
        {activeTab === 'songs' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
            {songRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/40">Aún no hay recomendaciones de canciones.</div>
            ) : (
              songRequests.map((song) => (
                <div key={song.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#d4af37]/10 text-[#d4af37] rounded-xl shrink-0"><Disc className="w-5 h-5" /></div>
                    <div>
                      <p className="text-sm font-medium text-white">{song.cancion || 'Ver Enlace'}</p>
                      <p className="text-xs text-[#d4af37]">{song.artista || 'Artista no especificado'}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">Sugerido por: {song.nombre_invitado || 'Anónimo'}</p>
                    </div>
                  </div>
                  {song.link && (
                    <a href={song.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-[#d4af37]/20 border border-white/10 text-[#d4af37] rounded-lg shrink-0">
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* MODAL NUEVO INVITADO */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#121212] border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-playfair text-white">Agregar Nuevo Invitado</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-white/40 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateGuest} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#d4af37] uppercase tracking-wider mb-1 font-semibold">Nombre Completo <span className="text-red-400">*</span></label>
                  <input type="text" required value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} placeholder="Ej. Juan Carlos Pérez" className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none" />
                </div>
                <div>
                  <label className="block text-[#d4af37] uppercase tracking-wider mb-1 font-semibold">Número de Celular (Opcional)</label>
                  <input type="tel" value={newGuestPhone} onChange={(e) => setNewGuestPhone(e.target.value)} placeholder="Ej. 987654321" className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none" />
                </div>
                <div>
                  <label className="block text-[#d4af37] uppercase tracking-wider mb-1 font-semibold">Número de Mesa (Opcional)</label>
                  <input type="number" value={newGuestTable} onChange={(e) => setNewGuestTable(e.target.value)} placeholder="Ej. 5" className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none" />
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium border border-white/10">Cancelar</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#722F37] hover:bg-[#8b3843] text-white font-semibold rounded-xl border border-[#722F37] flex items-center justify-center gap-2">{loading ? 'Guardando...' : 'Guardar Invitado'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}