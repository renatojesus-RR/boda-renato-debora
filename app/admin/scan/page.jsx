'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, QrCode, Search, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';

export default function SecurityScanner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'manual'
  const [guests, setGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanResult, setScanResult] = useState(null); // null | 'success' | 'used' | 'not_found'
  
  // Login y Fetch Inicial
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });
      const result = await res.json();
      if (res.ok) {
        // Solo traemos a los que confirmaron que SÍ asisten
        const confirmedOnly = result.rsvps.filter(g => g.asistira);
        setGuests(confirmedOnly);
        setIsAuthenticated(true);
      } else {
        alert("PIN Incorrecto");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Función para procesar el Check-In (Por QR o Manual)
  const processCheckIn = async (guestId) => {
    const guest = guests.find(g => g.id === guestId);
    
    if (!guest) {
      setScanResult('not_found');
      return;
    }

    if (guest.ingreso_confirmado) {
      setScanResult('used'); // "Pase ya utilizado"
      return;
    }

    // Si todo está bien, lo marcamos en la base de datos
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pinInput,
          action: 'check_in_guest',
          guestId: guest.id
        }),
      });

      if (res.ok) {
        setScanResult('success');
        // Actualizar el estado local para reflejar que ya entró
        setGuests(prev => prev.map(g => g.id === guestId ? { ...g, ingreso_confirmado: true } : g));
        
        // Limpiar el mensaje de éxito después de 3 segundos
        setTimeout(() => setScanResult(null), 3000);
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const filteredGuests = guests.filter(g => 
    g.nombre_invitado?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // VISTA 1: LOGIN (Idéntica al Admin)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 p-8 rounded-3xl w-full max-w-sm text-center">
          <ShieldCheck className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
          <h1 className="text-xl text-white font-playfair mb-6">Seguridad - Acceso</h1>
          <input
            type="password"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="PIN de Seguridad"
            className="w-full text-center py-3 bg-black/60 border border-white/10 rounded-xl text-white mb-4"
          />
          <button type="submit" className="w-full py-3 bg-[#722F37] text-white rounded-xl">Ingresar</button>
        </form>
      </div>
    );
  }

  // VISTA 2: PANEL DE CONTROL DE PUERTA
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="bg-[#1a1a1a] p-4 border-b border-white/10 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="font-playfair text-lg text-[#d4af37]">Control de Acceso</h1>
          <p className="text-[10px] text-white/50 uppercase tracking-widest">Renato & Débora</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-emerald-400">
            {guests.filter(g => g.ingreso_confirmado).length} <span className="text-sm text-white/50 font-normal">/ {guests.length}</span>
          </p>
          <p className="text-[10px] text-white/50 uppercase">Ingresos</p>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto">
        {/* Selector de Modo */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${activeTab === 'scanner' ? 'bg-[#d4af37] text-black' : 'text-white/50'}`}
          >
            <QrCode className="w-4 h-4" /> Escáner QR
          </button>
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${activeTab === 'manual' ? 'bg-[#722F37] text-white' : 'text-white/50'}`}
          >
            <UserCheck className="w-4 h-4" /> Lista Manual
          </button>
        </div>

        {/* Alertas de Escaneo */}
        {scanResult === 'success' && (
          <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold">¡Acceso Permitido!</p>
          </div>
        )}
        {scanResult === 'used' && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold uppercase">Acceso Denegado</p>
            <p className="text-xs">Este pase ya fue utilizado anteriormente.</p>
            <button onClick={() => setScanResult(null)} className="mt-3 px-4 py-1 bg-red-500 text-white rounded-lg text-xs">Cerrar Alerta</button>
          </div>
        )}

        {/* TAB 1: ESCÁNER (Estructura base lista para conectar librería de cámara) */}
        {activeTab === 'scanner' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center aspect-square flex flex-col items-center justify-center">
             <QrCode className="w-16 h-16 text-white/20 mb-4" />
             <p className="text-sm text-white/50 mb-4">Área de escaneo de cámara en desarrollo.</p>
             {/* Aquí inyectarás el componente <QrReader /> más adelante */}
          </div>
        )}

        {/* TAB 2: LISTA MANUAL DE CONTINGENCIA */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                placeholder="Buscar invitado..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-[#d4af37] outline-none"
              />
            </div>

            <div className="space-y-2">
              {filteredGuests.map(guest => (
                <div key={guest.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{guest.nombre_invitado}</p>
                    <p className="text-xs text-[#d4af37]">Mesa {guest.numero_mesa}</p>
                  </div>
                  
                  {guest.ingreso_confirmado ? (
                    <span className="flex items-center gap-1 text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-3 h-3" /> Ingresó
                    </span>
                  ) : (
                    <button 
                      onClick={() => processCheckIn(guest.id)}
                      className="px-4 py-1.5 bg-[#722F37] text-white text-xs font-semibold rounded-lg hover:bg-[#8b3843] transition-colors"
                    >
                      Dar Acceso
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}