'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Heart, Sparkles, Palette, CalendarPlus } from 'lucide-react';
import Image from 'next/image';
import settings from '../config/settings';

export default function WeddingDetails() {
  const { wedding, venue, events, timeline, social } = settings;
  const [activeTab, setActiveTab] = useState(0);
  const [calendarUrl, setCalendarUrl] = useState('#');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const startDate = new Date(`${wedding.date}T${wedding.ceremony.time}:00`);
    const endDate = new Date(`${wedding.date}T${wedding.reception.endTime}:00`);
    
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    const eventDetails = {
      text: `Boda de ${settings.couple.bride.name} & ${settings.couple.groom.name}`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `¡Acompáñanos en nuestro gran día! ${social.hashtag}`,
      location: venue.ceremony.name
    };
    
    const queryParams = new URLSearchParams(eventDetails);
    setCalendarUrl(`https://calendar.google.com/calendar/render?action=TEMPLATE&${queryParams.toString()}`);
  }, [wedding, social, venue]);

  // Solo Ceremonia y Recepción llevan banner panorámico superior
  const getBannerData = () => {
    if (activeTab === 0) {
      return {
        image: venue.ceremony.heroImage,
        title: venue.ceremony.name,
        subtitle: `${venue.ceremony.address}, ${venue.ceremony.district}`,
        showButtons: true,
        mapLink: venue.ceremony.mapLink,
      };
    }
    if (activeTab === 1) {
      return {
        image: venue.reception.heroImage,
        title: venue.reception.name,
        subtitle: `${venue.reception.address}, ${venue.reception.district}`,
        showButtons: true,
        mapLink: venue.reception.mapLink,
      };
    }
    return null;
  };

  const bannerData = getBannerData();

  const detailTabs = [
    {
      id: 'ceremony',
      label: 'Ceremonia',
      icon: Heart,
      content: {
        title: events.ceremony.title,
        time: wedding.ceremony.displayTime,
        location: venue.ceremony.name,
        address: `${venue.ceremony.address}, ${venue.ceremony.district}`,
        notes: events.ceremony.notes
      }
    },
    {
      id: 'reception',
      label: 'Recepción',
      icon: Sparkles,
      content: {
        title: events.reception.title,
        time: wedding.reception.displayTime,
        location: venue.reception.name,
        address: `${venue.reception.address}, ${venue.reception.district}`,
        notes: events.reception.notes
      }
    },
    {
      id: 'timeline',
      label: 'Itinerario',
      icon: Clock,
      content: {
        title: "Programa del Día",
        items: timeline
      }
    },
    {
      id: 'dresscode',
      label: 'Vestimenta',
      icon: Palette,
      content: {
        title: "Código de Vestimenta",
        dressCode: events.ceremony.dressCode
      }
    }
  ];

  if (!mounted) return null;

  return (
    <section id="wedding-details" className="min-h-screen py-20 bg-[#1a1a1a] relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Banner Panorámico Superior - Solo en Ceremonia y Recepción */}
        <AnimatePresence mode="wait">
          {bannerData && (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-8 shadow-2xl">
                <Image
                  src={bannerData.image}
                  alt={bannerData.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-center">
                  <h3 className="text-3xl md:text-5xl font-playfair text-white mb-4">
                    {bannerData.title}
                  </h3>
                  <p className="text-lg text-[#faf8f3]/90 flex items-center justify-center gap-2 mb-6">
                    {bannerData.showButtons && <MapPin className="w-5 h-5 text-[#d4af37]" />}
                    {bannerData.subtitle}
                  </p>
                  
                  {bannerData.showButtons && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <a 
                        href={bannerData.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 bg-[#722F37] hover:bg-[#8b3843] border border-[#d4af37]/40 text-white rounded-full font-medium tracking-wide transition-all shadow-lg flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-[#d4af37]" />
                        Ver en Google Maps
                      </a>
                      <a 
                        href={calendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 bg-white/10 backdrop-blur-md text-white rounded-full font-medium tracking-wide border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
                      >
                        <CalendarPlus className="w-4 h-4 text-[#d4af37]" />
                        Añadir al Calendario
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pestañas de Navegación */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {detailTabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === index
                  ? 'bg-[#d4af37] text-[#1a1a1a] font-semibold shadow-lg scale-105'
                  : 'bg-white/5 text-[#faf8f3]/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === index ? 'text-[#1a1a1a]' : 'text-[#d4af37]'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de la Pestaña Activa */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Vista para Ceremonia o Recepción */}
              {(activeTab === 0 || activeTab === 1) && (
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-playfair text-[#d4af37] mb-2">
                      {detailTabs[activeTab].content.title}
                    </h3>
                    <div className="w-12 h-0.5 bg-[#d4af37] mx-auto opacity-70" />
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="text-center md:text-left">
                        <p className="text-xs uppercase tracking-widest text-[#d4af37] font-medium mb-2">Hora</p>
                        <p className="text-xl text-white font-light">{detailTabs[activeTab].content.time}</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-xs uppercase tracking-widest text-[#d4af37] font-medium mb-2">Lugar</p>
                        <p className="text-xl text-white font-light">{detailTabs[activeTab].content.location}</p>
                        <p className="text-sm text-[#faf8f3]/70 mt-1">{detailTabs[activeTab].content.address}</p>
                      </div>
                    </div>
                    
                    {(detailTabs[activeTab].content.notes || []).length > 0 && (
                      <div className="pt-8 border-t border-white/10">
                        <p className="text-xs uppercase tracking-widest text-[#d4af37] font-medium mb-4 text-center">Notas Importantes</p>
                        <ul className="space-y-3">
                          {(detailTabs[activeTab].content.notes || []).map((note, idx) => (
                            <li key={idx} className="flex items-start justify-center gap-3">
                              <span className="text-[#d4af37] mt-1">•</span>
                              <span className="text-[#faf8f3]/90 text-sm md:text-base">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vista para Itinerario (Timeline vertical) */}
              {activeTab === 2 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-playfair text-[#d4af37] mb-2">
                      {detailTabs[activeTab].content.title}
                    </h3>
                    <div className="w-12 h-0.5 bg-[#d4af37] mx-auto opacity-70" />
                  </div>

                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#d4af37]/50 before:to-transparent">
                    {(detailTabs[activeTab].content.items || []).map((item, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#d4af37]/40 bg-[#1a1a1a] text-[#d4af37] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-lg">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-md">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-playfair text-xl text-[#d4af37]">{item.title}</h4>
                            <span className="text-sm font-semibold text-[#e2a8b0]">{item.time}</span>
                          </div>
                          <p className="text-sm text-[#faf8f3]/80">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vista para Código de Vestimenta (Dimensiones verticales exactas + Foto 100% nítida) */}
              {activeTab === 3 && (
                <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl min-h-[950px] md:min-h-[1200px] flex flex-col justify-center items-center p-6 md:p-12">
                  
                  {/* Foto de fondo 100% limpia sin degradados */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src="/images/vestimenta.jpeg"
                      alt="Código de vestimenta"
                      fill
                      className="object-cover object-center opacity-100"
                      priority
                    />
                  </div>

                  {/* Tarjeta Glassmorphism flotante centrada */}
                  <div className="relative z-10 text-center w-full max-w-xl bg-[#0a0a0a]/85 backdrop-blur-md p-8 md:p-10 rounded-2xl border border-white/15 shadow-2xl space-y-6 my-auto">
                    <div>
                      <h3 className="text-3xl font-playfair text-[#d4af37] mb-2 drop-shadow">
                        {detailTabs[activeTab].content.title}
                      </h3>
                      <div className="w-12 h-0.5 bg-[#d4af37] mx-auto opacity-80 mb-6" />
                      
                      <p className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold mb-2">Dress Code</p>
                      <p className="text-3xl md:text-4xl text-white font-playfair mb-4 drop-shadow-md">
                        {detailTabs[activeTab].content.dressCode}
                      </p>
                      <p className="text-[#faf8f3] text-sm md:text-base leading-relaxed font-light drop-shadow">
                        Nos encantaría que nos acompañes vistiendo de manera elegante para la ocasión.<strong className="text-[#d4af37] font-medium"></strong>
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}