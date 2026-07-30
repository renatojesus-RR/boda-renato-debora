'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, Calendar, Camera, Mail, MapPin, Gift, UploadCloud } from 'lucide-react';
import settings from '../config/settings';
import { Music } from 'lucide-react';

export default function FloatingMenu() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [showSongOption, setShowSongOption] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar el menú cuando el usuario hace scroll hacia abajo más de 100px
      if (currentScrollY > 100 && !hasBeenShown) {
        setIsVisible(true);
        setHasBeenShown(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasBeenShown]);

  useEffect(() => {
  const checkActive = () => {
    if (settings.songRequest?.forceShow) return true;
    const weddingTime = new Date(`${settings.wedding.date}T${settings.wedding.ceremony.time}:00`).getTime();
    const activeStart = weddingTime - (24 * 60 * 60 * 1000);
    const activeEnd = weddingTime + (18 * 60 * 60 * 1000);
    const now = new Date().getTime();
    return now >= activeStart && now <= activeEnd;
  };
  setShowSongOption(checkActive());
}, []);

  // Lista de secciones actualizada con la nueva estructura de la web
  const menuItems = [
    { name: 'Inicio', href: '#hero', icon: Heart },
    { name: 'Cuenta Regresiva', href: '#countdown', icon: Calendar },
    { name: 'Detalles', href: '#wedding-details', icon: MapPin },
    { name: 'Nuestros Momentos', href: '#gallery', icon: Camera },
    { name: 'Captura el Momento', href: '#shared-moments', icon: UploadCloud },
    ...(showSongOption ? [{ name: 'Sugerir Canción', href: '#song-request', icon: Music }] : []),
    { name: 'Confirmar Asistencia', href: '#rsvp', icon: Mail },
    { name: 'Muestras de Cariño', href: '#registry', icon: Gift },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Botón Flotante */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="fixed top-6 right-6 z-[100]"
            >
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-12 h-12 bg-[#1a1a1a]/90 backdrop-blur-md rounded-full flex items-center justify-center border border-[#d4af37]/40 hover:border-[#d4af37] transition-colors group shadow-2xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Abrir menú de navegación"
              >
                <AnimatePresence mode="wait">
                  {!isOpen ? (
                    <motion.div
                      key="menu"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5 text-[#d4af37]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5 text-[#d4af37]" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Anillo con efecto de pulso en Dorado */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#d4af37]/50"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ pointerEvents: 'none' }}
                />
              </motion.button>
            </motion.div>

            {/* Panel Lateral Desplegable */}
            <AnimatePresence>
              {isOpen && (
                <>
                  {/* Backdrop / Fondo Oscuro */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                    onClick={() => setIsOpen(false)}
                  />

                  {/* Menú Drawer */}
                  <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-72 bg-[#1a1a1a]/95 backdrop-blur-md z-[95] border-l border-[#d4af37]/20 flex flex-col justify-between"
                  >
                    <div>
                      {/* Cabecera del Menú */}
                      <div className="p-6 border-b border-white/10">
                        <motion.h3 
                          className="font-playfair text-2xl text-left"
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="bg-gradient-to-r from-[#faf8f3] via-[#d4af37] to-[#faf8f3] bg-clip-text text-transparent font-medium">
                            {settings.couple.bride.name} & {settings.couple.groom.name}
                          </span>
                        </motion.h3>
                        <motion.p 
                          className="text-left text-xs text-[#d4af37] mt-2 tracking-wider uppercase font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {settings.wedding.displayDate}
                        </motion.p>
                      </div>

                      {/* Lista de Ítems del Menú */}
                      <nav className="p-6">
                        <ul className="space-y-2">
                          {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                              <motion.li
                                key={item.name}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + index * 0.04 }}
                              >
                                <button
                                  onClick={() => scrollToSection(item.href)}
                                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#d4af37]/10 transition-colors group"
                                >
                                  <Icon className="w-4 h-4 text-[#d4af37]/70 group-hover:text-[#d4af37] transition-colors shrink-0" />
                                  <span className="text-[#faf8f3]/80 group-hover:text-white transition-colors text-sm font-light">
                                    {item.name}
                                  </span>
                                  <motion.div
                                    className="ml-auto w-1.5 h-1.5 bg-[#d4af37] rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_6px_#d4af37]"
                                    whileHover={{ scale: 1.5 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                </button>
                              </motion.li>
                            );
                          })}
                        </ul>
                      </nav>
                    </div>

                    {/* Pie del Menú */}
                    <div className="p-6 border-t border-white/10">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                      >
                        <p className="text-[10px] text-[#faf8f3]/50 tracking-widest uppercase mb-1">
                          Comparte nuestra alegría
                        </p>
                        <p className="text-xs text-[#d4af37] font-medium tracking-wider">
                          {settings.social.hashtag}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </>
  );
}