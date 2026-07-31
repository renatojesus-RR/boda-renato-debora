'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle } from 'lucide-react';
import settings from '../config/settings';

export default function Footer() {
    const { couple, social, wedding } = settings;
    
    // Links directos a WhatsApp
    const groomPhone = couple.groom.phone?.replace(/[^0-9]/g, '') || '51987654321';
    const bridePhone = couple.bride.phone?.replace(/[^0-9]/g, '') || '51987654321';

    const contactLinks = [
        { 
            name: '🤵🏻', 
            label: `WhatsApp ${couple.groom.name}`, 
            href: `https://wa.me/${groomPhone}?text=Hola%20${couple.groom.name},%20tengo%20una%20consulta%20sobre%20la%20boda`,
            type: 'wa'
        },
        { 
            name: '👰🏻', 
            label: `WhatsApp ${couple.bride.name}`, 
            href: `https://wa.me/${bridePhone}?text=Hola%20${couple.bride.name},%20tengo%20una%20consulta%20sobre%20la%20boda`,
            type: 'wa'
        }
    ];

    const socialLinks = [
        { 
            name: '🤵🏻', 
            label: `Instagram de ${couple.groom.name}`, 
            href: social.instagram?.groom || 'https://www.instagram.com/bourb0n__/' 
        },
        { 
            name: '👰🏻', 
            label: `Instagram de ${couple.bride.name}`, 
            href: social.instagram?.bride || 'https://www.instagram.com/babby_gvrl2/' 
        }
    ];

    return (
        <footer className="py-20 bg-[#1a1a1a] relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div 
                    className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%]"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 20% 80%, #722F37 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, #722F37 0%, transparent 50%)
                        `,
                        animation: 'float 25s ease-in-out infinite'
                    }}
                />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    {/* Monograma de Iniciales Invertido: R & D */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-[#722F37]/40 bg-[#722F37]/10 mb-2 shadow-inner">
                        <span className="font-playfair text-2xl text-[#722F37] font-medium tracking-widest">
                            {couple.groom.name[0]} & {couple.bride.name[0]}
                        </span>
                    </div>

                    {/* Nombres: Renato & Débora */}
                    <div>
                        <h3 className="font-playfair text-3xl text-white mb-2 tracking-wide">
                            {couple.groom.name} <span className="text-[#722F37] font-serif">&</span> {couple.bride.name}
                        </h3>
                        <p className="text-xs text-[#faf8f3]/60 tracking-[3px] uppercase mb-6">
                            {wedding.displayDate}
                        </p>

                        <div className="space-y-2 mt-4">
                            <p className="font-playfair text-xl text-[#faf8f3]/90 italic">
                                Tenemos muchas ganas de celebrar contigo.
                            </p>
                            <p className="text-xs text-[#faf8f3]/50 font-light uppercase tracking-widest pt-2">
                                ¿Tienes alguna consulta? Escríbenos directamente:
                            </p>
                        </div>
                    </div>

                    {/* Botones de Contacto Directo por WhatsApp */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto pt-2">
                        {contactLinks.map((link, index) => (
                            <motion.a 
                                key={index} 
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-[#722F37]/30 hover:border-[#d4af37]/50 flex items-center justify-center gap-2 text-xs text-[#faf8f3]/90 transition-all duration-300 shadow-md group"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span className="text-base">{link.name}</span>
                                <MessageCircle className="w-3.5 h-3.5 text-[#d4af37] group-hover:scale-110 transition-transform" />
                                <span className="font-medium tracking-wider">WhatsApp {index === 0 ? couple.groom.name : couple.bride.name}</span>
                            </motion.a>
                        ))}
                    </div>

                    {/* Redes Sociales (Instagram) */}
                    <div className="pt-2">
                        <p className="text-[10px] text-[#faf8f3]/40 uppercase tracking-widest mb-3">
                            O visítanos en Instagram:
                        </p>
                        <div className="flex justify-center items-center gap-4">
                            {socialLinks.map((link, index) => (
                                <motion.a 
                                    key={index} 
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={link.label}
                                    className="w-11 h-11 rounded-full border border-white/10 bg-white/5 hover:bg-[#722F37]/20 hover:border-[#722F37] flex items-center justify-center text-xl transition-all duration-300 shadow-lg"
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span>{link.name}</span>
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Separador y Créditos */}
                    <div className="pt-8 border-t border-white/10 max-w-xs mx-auto">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="inline-block mb-3"
                        >
                            <Heart className="w-5 h-5 text-[#722F37] fill-[#722F37] mx-auto" />
                        </motion.div>

                        <p className="text-xs text-[#faf8f3] opacity-60 tracking-wider uppercase">
                            Hecho con amor para nuestro gran día
                        </p>
                        
                        <p className="text-[10px] text-[#faf8f3] opacity-50 mt-4">
                            Diseñado y Desarrollado por{' '}
                            <a 
                                href="https://www.linkedin.com/in/renatojesusrr/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#d4af37] hover:text-white transition-colors duration-300 underline font-medium"
                            >
                                Renato Rodríguez
                            </a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}