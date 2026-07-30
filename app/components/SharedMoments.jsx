'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, UploadCloud, QrCode, Smartphone } from 'lucide-react';
import Image from 'next/image';
import settings from '../config/settings';

export default function SharedMoments() {
  const { sharedMoments } = settings;
  const [mounted, setMounted] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!sharedMoments?.enabled || !mounted) return null;

  return (
    <section id="shared-moments" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      
      {/* Background Decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(114,47,55,0.15)_0%,_transparent_60%)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        
        {/* Ícono animado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          viewport={{ once: true }}
          className="w-20 h-20 mx-auto bg-[#d4af37]/10 rounded-full border border-[#d4af37]/30 flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
        >
          <Camera className="w-10 h-10 text-[#d4af37]" />
        </motion.div>

        {/* Textos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4 mb-10"
        >
          <h2 className="font-playfair text-4xl md:text-5xl text-white font-thin tracking-wide">
            {sharedMoments.title}
          </h2>
          <p className="text-xs md:text-sm uppercase tracking-[3px] text-[#d4af37] font-medium">
            {sharedMoments.subtitle}
          </p>
          <p className="text-[#faf8f3]/70 font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed pt-2">
            {sharedMoments.message}
          </p>
        </motion.div>

        {/* Tarjeta de Acción */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 max-w-xl mx-auto shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Smartphone className="w-24 h-24 text-white" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            
            {/* Botón Principal a Google Forms/Drive */}
            <a 
              href={sharedMoments.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#722F37] text-white rounded-full font-medium tracking-wider uppercase text-sm hover:bg-[#8b3843] transition-all shadow-lg flex items-center justify-center gap-3 border border-[#722F37] hover:border-[#d4af37]/50"
            >
              <UploadCloud className="w-5 h-5" />
              {sharedMoments.buttonText}
            </a>

            {/* Alternativa con QR */}
            {sharedMoments.qrImage && (
              <div className="w-full pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowQr(!showQr)}
                  className="text-xs text-[#faf8f3]/60 hover:text-[#d4af37] transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                >
                  <QrCode className="w-4 h-4" />
                  {showQr ? 'Ocultar Código QR' : 'Escanear Código QR en su lugar'}
                </button>

                {/* Desplegable del QR */}
                <AnimatePresence>
                  {showQr && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden flex flex-col items-center"
                    >
                      <div className="p-3 bg-white rounded-2xl shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                        <div className="relative w-40 h-40">
                          <Image 
                            src={sharedMoments.qrImage}
                            alt="QR para subir fotos"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-[#faf8f3]/40 mt-3 tracking-widest uppercase">
                        Apunta la cámara de tu celular
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
}