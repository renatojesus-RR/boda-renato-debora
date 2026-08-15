'use client'

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Users, ShieldAlert, ArrowLeft, RefreshCw, Check } from 'lucide-react';
import Link from 'next/link';

export default function AdminMesasPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Inicializar SIEMPRE con array vacío [] para evitar undefined.filter()
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);

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
        // Garantizar fallback a array vacío
        setGuests(result.rsvps || []);
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

  const handleUpdateTable = async (guestId, newTable) => {
    const tableNumber = newTable ? parseInt(newTable) : null;
    
    // Actualización optimista en la interfaz
    setGuests(prev => (prev || []).map(g => g.id === guestId ? { ...g, numero_mesa: tableNumber } : g));

    try {
      await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pinInput,
          action: 'edit_guest_table', // O la acción configurada en tu route.js
          guestId: guestId,
          guestData: { numero_mesa: tableNumber }
        }),
      });
    } catch (error) {
      console.error("Error al actualizar mesa:", error);
    }
  };

  // 1. Pantalla de Login por PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 bg-[#722F37]/20 border border-[#722F37]/50 rounded-full flex items-center justify-center mx-auto text-[#d4af37]">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-playfair text-2xl text-white">Asignación de Mesas</h1>
            <p className="text-xs text-[#d4af37] uppercase tracking-widest mt-1">Acceso Administrativo</p>
          </div>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Ingresa el PIN"
              className="w-full text-center py-3.5 text-lg font-mono bg-black/60 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-red-400 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> PIN incorrecto
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#722F37] hover:bg-[#8b3843] text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              {loading ? 'Validando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Lista segura de confirmados
  const safeGuests = Array.isArray(guests) ? guests : [];
  const confirmedGuests = safeGuests.filter(g => g.asistira);
  const unassignedGuests = confirmedGuests.filter(g => !g.numero_mesa);
  
  // Generar números de mesa (ej. Mesas del 1 al 15)
  const tableNumbers = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-[#d4af37]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-playfair text-2xl text-white">Organizador de Mesas</h1>
              <p className="text-xs text-[#d4af37] uppercase tracking-widest">
                {confirmedGuests.length} Confirmados | {unassignedGuests.length} Sin Mesa
              </p>
            </div>
          </div>
        </div>

        {/* Panel de Invitados sin mesa */}
        {unassignedGuests.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
            <h3 className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-3">
              Invitados confirmados pendientes de mesa ({unassignedGuests.length}):
            </h3>
            <div className="flex flex-wrap gap-2">
              {unassignedGuests.map(guest => (
                <div key={guest.id} className="bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                  <span>{guest.nombre_invitado}</span>
                  <select
                    onChange={(e) => handleUpdateTable(guest.id, e.target.value)}
                    defaultValue=""
                    className="bg-[#1a1a1a] text-[#d4af37] border border-white/20 rounded px-1.5 py-0.5 text-[10px] outline-none"
                  >
                    <option value="" disabled>Mesa</option>
                    {tableNumbers.map(n => (
                      <option key={n} value={n}>Mesa {n}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid de Mesas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tableNumbers.map((mesaNum) => {
            const tableGuests = safeGuests.filter(g => g.numero_mesa === mesaNum);

            return (
              <div key={mesaNum} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h2 className="font-playfair text-lg text-[#d4af37]">Mesa {mesaNum}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                    {tableGuests.length} personas
                  </span>
                </div>

                <div className="space-y-1.5 min-h-[80px]">
                  {tableGuests.length === 0 ? (
                    <p className="text-xs text-white/30 italic py-2">Mesa vacía</p>
                  ) : (
                    tableGuests.map(guest => (
                      <div key={guest.id} className="flex items-center justify-between text-xs bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
                        <span className="truncate pr-2">{guest.nombre_invitado}</span>
                        <button
                          onClick={() => handleUpdateTable(guest.id, null)}
                          className="text-[10px] text-red-400/60 hover:text-red-400"
                          title="Quitar de esta mesa"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}