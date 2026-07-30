'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiExplosion from 'react-confetti-explosion';
import settings from '../config/settings';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [mounted, setMounted] = useState(false);
  const [isWeddingDay, setIsWeddingDay] = useState(false);
  const [isPastWedding, setIsPastWedding] = useState(false);

  const handleCountdownClick = () => {
    // Trigger background music to play
    window.dispatchEvent(new Event('playBackgroundMusic'));
  };

  const scrollToNext = () => {
    const nextSection = document.querySelector('#wedding-details');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const weddingDate = new Date(`${settings.wedding.date}T${settings.wedding.ceremony.time}:00`).getTime();
      const weddingEndDate = new Date(`${settings.wedding.date}T23:59:59`).getTime();
      const now = new Date().getTime();
      const distance = weddingDate - now;
      const distanceToEnd = weddingEndDate - now;

      if (distance > 0) {
        // Before wedding
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
        setIsWeddingDay(false);
        setIsPastWedding(false);
      } else if (distanceToEnd > 0) {
        // Wedding day
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsWeddingDay(true);
        setIsPastWedding(false);
      } else {
        // After wedding
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsWeddingDay(false);
        setIsPastWedding(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="countdown" className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-[#faf8f3] via-white to-[#f5f0e8] relative overflow-hidden" onClick={handleCountdownClick}>
      
      {/* Lluvia de Confeti si es el Día de la Boda */}
      {isWeddingDay && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50">
          <ConfettiExplosion 
            force={0.8} 
            duration={5000} 
            particleCount={250} 
            width={1600} 
            colors={['#722F37', '#d4af37', '#e2a8b0', '#ffffff']} 
          />
        </div>
      )}

      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        {mounted && (
          <motion.div 
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#f4e4a1]/20 via-[#ffd700]/10 to-transparent rounded-full blur-3xl will-change-transform"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {mounted && (
          <motion.div 
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#ffb6c1]/15 via-[#ffc0cb]/10 to-transparent rounded-full blur-3xl will-change-transform"
            animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {mounted && (
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#ffe4b5]/15 to-[#ffd700]/10 rounded-full blur-3xl will-change-transform"
            animate={{ scale: [0.8, 1.1, 0.8], rotate: [0, 180, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* Floating stars and hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static sparkle stars */}
        {mounted && [...Array(40)].map((_, i) => {
          const colors = ['text-[#722F37]/50', 'text-[#ff9999]/40', 'text-[#87ceeb]/40', 'text-[#dda0dd]/40', 'text-[#f0e68c]/50'];
          const color = colors[i % colors.length];
          return (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 29) % 100}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [(i % 3) * 0.2 + 0.3, (i % 3) * 0.3 + 0.5, (i % 3) * 0.2 + 0.3] }}
              transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: (i * 0.2) % 3, ease: "easeInOut" }}
            >
              <svg className={`w-3 h-3 ${color}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
              </svg>
            </motion.div>
          );
        })}

        {/* Floating small hearts */}
        {mounted && [...Array(15)].map((_, i) => {
          const heartColors = ['text-[#ffb6c1]/35', 'text-[#ff9999]/30', 'text-[#ffc0cb]/35', 'text-[#dda0dd]/30', 'text-[#f4a460]/30'];
          const color = heartColors[i % heartColors.length];
          return (
            <motion.div
              key={`heart-${i}`}
              className="absolute"
              style={{ left: `${(i * 67) % 100}%`, bottom: '-5%' }}
              animate={{ 
                y: ['0vh', '-110vh'],
                x: [0, (i % 2 ? 20 : -20), 0],
                rotate: [0, (i % 2 ? 15 : -15), 0],
              }}
              transition={{ duration: 25 + (i % 3) * 10, repeat: Infinity, delay: i * 3, ease: "linear" }}
            >
              <svg className={`w-4 h-4 ${color}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </motion.div>
          );
        })}
      </div>

      <div className="max-w-6xl w-full mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.p
            className="text-xs md:text-sm tracking-[0.3em] uppercase text-[#722F37] mb-4 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {settings.wedding.day}, {settings.wedding.displayDate}
          </motion.p>
          
          <motion.h2 
            className="font-playfair text-[clamp(2.5rem,6vw,4rem)] font-light mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-[#d4af37] via-[#b8952b] to-[#d4af37] bg-clip-text text-transparent">
              RESERVA LA FECHA
            </span>
          </motion.h2>
          
          <motion.p
            className="text-lg text-[#1a1a1a]/60 font-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {settings.couple.groom.name} & {settings.couple.bride.name}
          </motion.p>
        </motion.div>

        {/* Countdown Display or Wedding Message */}
        {mounted && (
          <>
            {/* Show countdown before wedding */}
            {!isWeddingDay && !isPastWedding && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Main countdown container */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10">
                  {/* Días */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={timeLeft.days}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <span className="font-playfair text-[clamp(7rem,12vw,9rem)] leading-none text-[#1a1a1a] font-thin drop-shadow-sm">
                          {String(timeLeft.days).padStart(2, '0')}
                        </span>
                        <span className="absolute -top-2 -right-8 text-xs tracking-[0.2em] uppercase text-[#722F37] font-semibold">
                          Días
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>

                  {/* Separator */}
                  <div className="hidden lg:block text-5xl text-[#722F37]/30 font-thin">:</div>

                  {/* Hours, Minutes, Seconds */}
                  <div className="flex items-center gap-4 lg:gap-6">
                    {[
                      { value: timeLeft.hours, label: 'horas' },
                      { value: timeLeft.minutes, label: 'minutos' },
                      { value: timeLeft.seconds, label: 'segundos' }
                    ].map((unit, index) => (
                      <React.Fragment key={unit.label}>
                        {index > 0 && (
                          <span className="text-3xl text-[#722F37]/30 font-thin">:</span>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="text-center"
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={unit.value}
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -10, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="relative"
                            >
                              <span className="font-playfair text-[clamp(2.5rem,5vw,3.5rem)] text-[#1a1a1a] font-light">
                                {String(unit.value).padStart(2, '0')}
                              </span>
                            </motion.div>
                          </AnimatePresence>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-[#722F37]/60 mt-2 font-medium">
                            {unit.label}
                          </p>
                        </motion.div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Decorative line underneath */}
                <motion.div
                  className="mt-16 h-px max-w-xl mx-auto bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  viewport={{ once: true }}
                />
              </motion.div>
            )}

            {/* Show special message on wedding day */}
            {isWeddingDay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="text-center relative z-25"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="font-playfair text-[clamp(3.5rem,8vw,6rem)] text-[#d4af37] font-light drop-shadow-md">
                    ¡Hoy es el gran día!
                  </span>
                </motion.div>
                <p className="text-xl text-[#1a1a1a]/70 mt-6 font-light">
                  Acompáñanos a celebrar nuestro amor.
                </p>
              </motion.div>
            )}

            {/* Show thank you message after wedding */}
            {isPastWedding && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-center max-w-3xl mx-auto"
              >
                <motion.h2
                  className="font-playfair text-[clamp(2.5rem,6vw,4rem)] text-[#d4af37] font-light mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  Gracias por celebrar con nosotros
                </motion.h2>
              </motion.div>
            )}
          </>
        )}

        {/* FRASE INSPIRACIONAL AL FINAL DEL CONTADOR */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.p 
            className="font-playfair text-lg lg:text-2xl italic text-[#722F37] font-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true }}
          >
            "Pasan los días, pero lo verdadero permanece para siempre."
          </motion.p>
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 cursor-pointer group z-20"
        onClick={scrollToNext}
      >
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[30px] h-[50px] border border-[#d4af37]/50 rounded-full flex items-start justify-center p-2 group-hover:border-[#d4af37] transition-colors"
          >
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-2 bg-[#d4af37] rounded-full shadow-[0_0_6px_#d4af37]"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}