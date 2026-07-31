'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, CreditCard, Home, Copy, Check, QrCode } from 'lucide-react';
import Image from 'next/image';
import settings from '../config/settings';

export default function Registry() {
  const { registry } = settings;
  const [activeTab, setActiveTab] = useState(null); // null = Oculto por defecto
  const [copiedField, setCopiedField] = useState(null);
  const [openQrIdx, setOpenQrIdx] = useState(null); // Guarda el índice del QR activo

  if (!registry?.enabled) return null;

  const handleCopy = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleTab = (tab) => {
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const toggleQr = (idx) => {
    setOpenQrIdx(prev => prev === idx ? null : idx);
  };

  return (
    <section id="registry" className="py-24 bg-[#1a1a1a] relative overflow-hidden">
      
      {/* Background sutil */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div 
          className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #d4af37 0%, transparent 60%)`,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        
        {/* Cabecera */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[0.5px] w-12 bg-gradient-to-r from-transparent to-[#d4af37]" />
            <Gift className="w-5 h-5 text-[#d4af37]" />
            <div className="h-[0.5px] w-12 bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>

          <h2 className="font-playfair text-4xl md:text-5xl text-white font-thin mb-3 tracking-wide">
            {registry.title}
          </h2>
          <p className="text-xs uppercase tracking-[3px] text-[#d4af37] font-medium mb-6">
            {registry.subtitle}
          </p>
          <p className="text-[#faf8f3]/80 font-light text-sm md:text-base max-w-2xl mx-auto leading-relaxed italic">
            "{registry.message}"
          </p>
        </motion.div>

        {/* Pestañas de Selección */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
          <button
            onClick={() => toggleTab('digital')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
              activeTab === 'digital'
                ? 'bg-[#d4af37] text-[#1a1a1a] border-[#d4af37] shadow-lg scale-105 font-semibold'
                : 'bg-white/5 text-[#faf8f3]/70 border-white/10 hover:bg-white/10'
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeTab === 'digital' ? 'text-[#1a1a1a]' : 'text-[#d4af37]'}`} />
            Lluvia de Sobres Digital
          </button>

          <button
            onClick={() => toggleTab('physical')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
              activeTab === 'physical'
                ? 'bg-[#d4af37] text-[#1a1a1a] border-[#d4af37] shadow-lg scale-105 font-semibold'
                : 'bg-white/5 text-[#faf8f3]/70 border-white/10 hover:bg-white/10'
            }`}
          >
            <Home className={`w-4 h-4 ${activeTab === 'physical' ? 'text-[#1a1a1a]' : 'text-[#d4af37]'}`} />
            Entrega Presencial
          </button>
        </div>

        {/* Contenido Dinámico */}
        <AnimatePresence mode="wait">
          {activeTab === 'digital' && (
            <motion.div
              key="digital"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            >
              {registry.banks?.map((bank, idx) => (
                <div 
                  key={idx}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left relative flex flex-col justify-between hover:border-[#d4af37]/40 transition-all shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-playfair text-xl text-[#d4af37] font-medium">
                        {bank.name}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider bg-white/10 text-[#faf8f3]/70 px-2.5 py-1 rounded-full border border-white/10">
                        {bank.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#faf8f3]/60 mb-4">
                      Titular: <span className="text-white font-medium">{bank.holder}</span>
                    </p>

                    {/* Número de Cuenta / Teléfono */}
                    {(bank.accountNumber || bank.number) && (
                      <div className="mb-3">
                        <p className="text-[10px] uppercase text-[#d4af37] tracking-widest mb-1">
                          {bank.accountNumber ? 'Número de Cuenta' : 'Teléfono / Yape'}
                        </p>
                        <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                          <span className="font-mono text-sm text-white tracking-wider">
                            {bank.accountNumber || bank.number}
                          </span>
                          <button
                            onClick={() => handleCopy(bank.accountNumber || bank.number, `num-${idx}`)}
                            className="text-[#d4af37] hover:text-white p-1 transition-colors"
                            title="Copiar"
                          >
                            {copiedField === `num-${idx}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CCI si existe */}
                    {bank.cci && (
                      <div className="mb-2">
                        <p className="text-[10px] uppercase text-[#d4af37] tracking-widest mb-1">CCI (Interbancario)</p>
                        <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                          <span className="font-mono text-xs text-[#faf8f3]/90 tracking-wider">
                            {bank.cci}
                          </span>
                          <button
                            onClick={() => handleCopy(bank.cci, `cci-${idx}`)}
                            className="text-[#d4af37] hover:text-white p-1 transition-colors"
                            title="Copiar CCI"
                          >
                            {copiedField === `cci-${idx}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón ver QR inductivo por tarjeta */}
                  {bank.qrImage && (
                    <button
                      onClick={() => toggleQr(idx)}
                      className="mt-4 w-full py-2 bg-white/5 hover:bg-[#d4af37]/20 border border-white/10 hover:border-[#d4af37] text-xs text-white rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <QrCode className="w-4 h-4 text-[#d4af37]" />
                      {openQrIdx === idx ? 'Ocultar Código QR' : 'Mostrar Código QR'}
                    </button>
                  )}

                  {/* Desplegable QR específico */}
                  {bank.qrImage && openQrIdx === idx && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 p-3 bg-white rounded-xl text-center flex justify-center"
                    >
                      <div className="relative w-40 h-40">
                        <Image 
                          src={bank.qrImage} 
                          alt="Código QR Yape/Plin" 
                          fill 
                          className="object-contain" 
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* PESTAÑA ENTREGA PRESENCIAL */}
          {activeTab === 'physical' && (
            <motion.div
              key="physical"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto text-center shadow-xl space-y-6"
            >
              <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37]">
                <Home className="w-6 h-6" />
              </div>

              <h3 className="font-playfair text-2xl text-white">
                {registry.physical.title}
              </h3>

              <p className="text-sm text-[#faf8f3]/80 font-light leading-relaxed">
                {registry.physical.description}
              </p>

              {/* Renderizado adaptativo de direcciones */}
              {registry.physical.addresses ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
                  {registry.physical.addresses.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-black/40 p-5 rounded-xl border border-white/10 hover:border-[#d4af37]/40 transition-all flex flex-col justify-between space-y-2"
                    >
                      <div>
                        <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">
                          {item.label}
                        </span>
                        <p className="text-white font-medium text-sm leading-snug">
                          {item.street || item.address}
                        </p>
                        <p className="text-xs text-[#d4af37]/80 mt-1">
                          {item.district}
                        </p>
                      </div>
                      {item.notes && (
                        <p className="text-[10px] text-[#faf8f3]/40 italic pt-2 border-t border-white/5">
                          * {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 max-w-md mx-auto space-y-1">
                  <p className="text-white font-medium text-base">
                    {registry.physical.address}
                  </p>
                  <p className="text-xs text-[#d4af37]">
                    {registry.physical.district}
                  </p>
                </div>
              )}

              {registry.physical.notes && !registry.physical.addresses && (
                <p className="text-xs text-[#faf8f3]/50 italic pt-2">
                  * {registry.physical.notes}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}