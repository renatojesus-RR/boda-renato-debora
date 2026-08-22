'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, QrCode, Search, CheckCircle2, AlertTriangle, UserCheck, XCircle } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function SecurityScanner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'manual'
  const [guests, setGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  const processCheckIn = async (guestId) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const guest = guests.find(g => g.id === guestId);
    
    if (!guest) {
      setScanResult({ type: 'not_found', guestName: 'Código Desconocido', mesa: '-' });
      setTimeout(() => { setScanResult(null); setIsProcessing(false); }, 3000);
      return;
    }

    if (guest.ingreso_confirmado) {
      setScanResult({ type: 'used', guestName: guest.nombre_invitado, mesa: guest.numero_mesa });
      setTimeout(() => { setScanResult(null); setIsProcessing(false); }, 4000);
      return;
    }

    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput, action: 'check_in_guest', guestId: guest.id }),
      });

      if (res.ok) {
        setScanResult({ type: 'success', guestName: guest.nombre_invitado, mesa: guest.numero_mesa });
        setGuests(prev => prev.map(g => g.id === guestId ? { ...g, ingreso_confirmado: true } : g));
        setTimeout(() => { setScanResult(null); setIsProcessing(false); }, 3000);
      }
    } catch (err) {
      alert("Error de conexión");
      setIsProcessing(false);
    }
  };

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const scannedId = detectedCodes[0].rawValue;
      processCheckIn(scannedId);
    }
  };

  const filteredGuests = guests.filter(g => 
    g.nombre_invitado?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // VISTA LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
          <ShieldCheck className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
          <h1 className="text-xl text-white font-playfair mb-6">Seguridad - Acceso</h1>
          <input
            type="password"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="PIN de Seguridad"
            className="w-full text-center py-3 bg-black/60 border border-white/10 rounded-xl text-white mb-4 outline-none focus:border-[#d4af37]"
            autoFocus
          />
          <button type="submit" className="w-full py-3 bg-[#722F37] text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-colors hover:bg-[#8b3843]">Ingresar</button>
        </form>
      </div>
    );
  }

  // VISTA PANEL
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="bg-[#1a1a1a] p-4 border-b border-white/10 flex justify-between items-center sticky top-0 z-40">
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
        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${activeTab === 'scanner' ? 'bg-[#d4af37] text-black' : 'text-white/50 hover:text-white'}`}
          >
            <QrCode className="w-4 h-4" /> Escáner QR
          </button>
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${activeTab === 'manual' ? 'bg-[#722F37] text-white' : 'text-white/50 hover:text-white'}`}
          >
            <UserCheck className="w-4 h-4" /> Lista Manual
          </button>
        </div>

        <div className="relative">
          <AnimatePresence>
            {scanResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/90 backdrop-blur-sm rounded-2xl"
              >
                {scanResult.type === 'success' && (
                  <div className="w-full p-6 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                    <p className="font-bold text-xl uppercase tracking-wider mb-2">Acceso Permitido</p>
                    <p className="text-white text-2xl font-playfair mb-2">{scanResult.guestName}</p>
                    {scanResult.mesa && <p className="text-emerald-300 font-bold text-lg">MESA {scanResult.mesa}</p>}
                  </div>
                )}
                {scanResult.type === 'used' && (
                  <div className="w-full p-6 bg-red-500/20 border border-red-500/50 rounded-2xl text-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                    <p className="font-bold text-xl uppercase tracking-wider mb-2">Pase Utilizado</p>
                    <p className="text-white text-lg font-playfair mb-2">{scanResult.guestName}</p>
                    <p className="text-xs text-red-300/70">Este QR ya registró ingreso.</p>
                  </div>
                )}
                {scanResult.type === 'not_found' && (
                  <div className="w-full p-6 bg-amber-500/20 border border-amber-500/50 rounded-2xl text-center text-amber-400">
                    <XCircle className="w-16 h-16 mx-auto mb-4" />
                    <p className="font-bold text-xl uppercase tracking-wider mb-2">QR Inválido</p>
                    <p className="text-xs text-amber-300/70">Este código no pertenece al evento.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'scanner' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-square flex flex-col items-center justify-center relative">
               {!scanResult ? (
                 <div className="w-full h-full object-cover">
                   <Scanner 
                      onScan={handleScan}
                      formats={['qr_code']}
                      components={{ audio: false, finder: false }}
                      styles={{ container: { width: '100%', height: '100%' } }}
                   />
                   <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                      <div className="absolute inset-0 border-2 border-[#d4af37]/50 rounded-xl m-8" />
                   </div>
                 </div>
               ) : (
                 <p className="text-white/50 text-sm animate-pulse">Procesando...</p>
               )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Buscar invitado..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-[#d4af37] outline-none text-white"
                />
              </div>

              <div className="space-y-2 h-[60vh] overflow-y-auto pr-2 pb-20">
                {filteredGuests.map(guest => (
                  <div key={guest.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-white">{guest.nombre_invitado}</p>
                      {guest.numero_mesa ? (
                        <p className="text-xs text-[#d4af37]">Mesa {guest.numero_mesa}</p>
                      ) : (
                        <p className="text-xs text-white/30">Sin mesa</p>
                      )}
                    </div>
                    
                    {guest.ingreso_confirmado ? (
                      <span className="flex items-center gap-1 text-[10px] text-white/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Ingresó
                      </span>
                    ) : (
                      <button 
                        onClick={() => processCheckIn(guest.id)}
                        disabled={isProcessing}
                        className="px-4 py-1.5 bg-[#722F37] text-white text-xs font-semibold rounded-lg hover:bg-[#8b3843] transition-colors uppercase tracking-wider"
                      >
                        Ingresar
                      </button>
                    )}
                  </div>
                ))}
                {filteredGuests.length === 0 && (
                  <p className="text-center text-white/30 text-xs mt-8">No se encontraron invitados.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}