'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import settings from '../config/settings';

export default function Footer() {
    const { couple, social } = settings;
    
    // Botones con emoticones de novio y novia a sus perfiles de Instagram
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
            <div className="absolute inset-0 opacity-5">
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

                    {/* Nombres Invertidos: Renato & Débora */}
                    <div>
                        <h3 className="font-playfair text-3xl text-white mb-2 tracking-wide">
                            {couple.groom.name} <span className="text-[#722F37] font-serif">&</span> {couple.bride.name}
                        </h3>
                        <p className="text-xs text-[#faf8f3]/60 tracking-[3px] uppercase mb-6">
                            {settings.wedding.displayDate}
                        </p>

                        {/* Mensaje recuperado */}
                        <div className="space-y-2 mt-4">
                            <p className="font-playfair text-xl text-[#faf8f3]/90 italic">
                                Tenemos muchas ganas de celebrar contigo.
                            </p>
                            <p className="text-sm text-[#faf8f3]/60 font-light">
                                Si tienes alguna pregunta, contáctanos en:
                            </p>
                        </div>
                    </div>

                    {/* Botones de Redes Sociales con Emojis 🤵🏻‍♂️ y 👰🏻‍♀️ */}
                    <div className="flex justify-center items-center gap-6 pt-2">
                        {socialLinks.map((link, index) => (
                            <motion.a 
                                key={index} 
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={link.label}
                                className="w-14 h-14 rounded-full border border-white/10 bg-white/5 hover:bg-[#722F37]/20 hover:border-[#722F37] flex items-center justify-center text-2xl transition-all duration-300 shadow-lg"
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>{link.name}</span>
                            </motion.a>
                        ))}
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