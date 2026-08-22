'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import Lightbox from './shared/Lightbox';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = Siguiente, -1 = Anterior
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 🔴 NUEVO: Cargar imágenes desde Supabase ordenadas por tu Drag & Drop
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPhotos(data);
        }
      } catch (err) {
        console.error('Error cargando galería:', err);
      }
    };

    fetchGallery();
  }, []);

  const slideNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const slidePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Variantes para la animación de deslizamiento
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
    },
    exit: (dir) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
    })
  };

  return (
    <>
      <section id="gallery" className="min-h-screen py-28 bg-[#0a0a0a] relative overflow-hidden flex flex-col justify-center">
        
        {/* Fondo Elegante con Degradados y Destellos */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f]"/>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#722F3715] via-transparent to-[#d4af3708]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.08)_0%,_transparent_50%)]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.1)_0%,_transparent_50%)]"/>
        </div>

        {/* Partículas Flotantes */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#d4af37]/30 rounded-full will-change-transform"
                style={{
                  left: `${(i * 17) % 100}%`,
                  top: `${(i * 23) % 100}%`
                }}
                animate={{
                  y: [-20, -120],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 10 + (i % 3) * 5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        )}

        <div className="max-w-5xl w-full mx-auto px-6 relative z-10">
          
          {/* Cabecera */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.div 
              className="h-[0.5px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mb-8 max-w-xl mx-auto"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              viewport={{ once: true }}
            />
            
            <h2 className="font-playfair text-[clamp(2.5rem,6vw,4.5rem)] font-thin tracking-[0.02em] mb-3">
              <span className="bg-gradient-to-r from-[#faf8f3] via-[#d4af37] to-[#faf8f3] bg-clip-text text-transparent">
                NUESTROS MOMENTOS
              </span>
            </h2>
            <p className="text-xs md:text-sm font-light tracking-[3px] uppercase text-[#d4af37]/80">
              Una colección de recuerdos
            </p>
          </motion.div>

          {/* Carrusel Principal */}
          {photos.length > 0 ? (
            <div className="relative max-w-3xl mx-auto">
              
              {/* Marco del Carrusel */}
              <div className="relative h-[380px] sm:h-[480px] md:h-[550px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black/40">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 cursor-pointer"
                    onClick={openLightbox}
                  >
                    <Image
                      src={photos[currentIndex]?.url}
                      alt={`Foto de la boda ${currentIndex + 1}`}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  </motion.div>
                </AnimatePresence>

                {/* Botón Maximizar (Pantalla Completa) */}
                <button
                  onClick={openLightbox}
                  className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#d4af37] hover:text-[#1a1a1a] hover:border-[#d4af37] transition-all duration-300 shadow-lg"
                  title="Ver en pantalla completa"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>

                {/* Controles de Navegación Flechas (Visibles si hay más de 1 foto) */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={slidePrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#d4af37] hover:text-[#1a1a1a] hover:border-[#d4af37] transition-all duration-300 shadow-lg group"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={slideNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#d4af37] hover:text-[#1a1a1a] hover:border-[#d4af37] transition-all duration-300 shadow-lg group"
                      aria-label="Siguiente"
                    >
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </>
                )}
              </div>

              {/* Tira de Miniaturas Nav / Puntos */}
              {photos.length > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6 px-2 overflow-x-auto py-2">
                  {photos.map((photo, idx) => (
                    <button
                      key={photo.id || idx}
                      onClick={() => goToSlide(idx)}
                      className={`relative rounded-xl overflow-hidden transition-all duration-300 shrink-0 ${
                        currentIndex === idx
                          ? 'w-14 h-14 md:w-16 md:h-16 border-2 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105'
                          : 'w-10 h-10 md:w-12 md:h-12 border border-white/20 opacity-40 hover:opacity-90'
                      }`}
                    >
                      <Image
                        src={photo.url}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-20 text-white/50 font-light italic">
              {mounted ? "Cargando galería..." : ""}
            </div>
          )}

          {/* Cierre con Versículo Bíblico */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-8">
                <div className="h-[0.5px] w-16 md:w-24 bg-gradient-to-r from-transparent to-[#d4af37]/50" />
                <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full mx-6 shadow-[0_0_8px_#d4af37]" />
                <div className="h-[0.5px] w-16 md:w-24 bg-gradient-to-l from-transparent to-[#d4af37]/50" />
              </div>

              <blockquote className="relative">
                <p className="font-playfair text-2xl lg:text-3xl font-thin italic text-[#faf8f3] leading-relaxed drop-shadow-md">
                  "Las aguas grandes no podrán apagar el amor, ni los ríos lo ahogarán."
                </p>
                <cite className="block mt-6 text-xs md:text-sm tracking-[0.4em] uppercase text-[#d4af37] font-medium not-italic">
                  — Cantares 8, 7
                </cite>
              </blockquote>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox para pantalla completa al hacer clic */}
      {photos.length > 0 && (
        <Lightbox
          images={photos}
          currentIndex={currentIndex}
          isOpen={isLightboxOpen}
          onClose={closeLightbox}
          onNavigate={(idx) => setCurrentIndex(idx)}
        />
      )}
    </>
  );
}