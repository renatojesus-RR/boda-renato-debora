'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, AlertCircle, Phone, User, QrCode, ShieldCheck, Calendar, Clock, X, HeartOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import QRCode from 'react-qr-code';
import settings from '../config/settings';

// Función para normalizar texto en las búsquedas (quitar acentos, paréntesis y mayúsculas)
const normalizeString = (str) => {
    if (!str) return '';
    let normalized = str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
        .toLowerCase();
    
    let sinParentesis = normalized.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    
    if (sinParentesis.length === 0) {
        return normalized.replace(/[()]/g, '').trim();
    }
    
    return sinParentesis;
};

// Función para imprimir en el pase VIP (conserva mayúsculas/acentos pero oculta las notas internas)
const getDisplayName = (str) => {
    if (!str) return '';
    let sinParentesis = str.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    if (sinParentesis.length === 0) {
        return str.replace(/[()]/g, '').trim();
    }
    return sinParentesis;
};

export default function RSVPForm() {
    const { rsvp } = settings;
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedData, setSubmittedData] = useState(null); 
    const [errorMsg, setErrorMsg] = useState('');
    const [isRetrieval, setIsRetrieval] = useState(false);

    // Lógica para verificar si la fecha límite ya venció
    const checkIsDeadlinePassed = () => {
        if (!rsvp?.deadline) return false;
        const deadlineDate = new Date(`${rsvp.deadline}T23:59:59`);
        const now = new Date();
        return now > deadlineDate;
    };

    const isDeadlinePassed = checkIsDeadlinePassed();

    const handleProcessRSVP = async (willAttend) => {
        setIsSubmitting(true);
        setErrorMsg('');
        setIsRetrieval(false);

        // 1. Validaciones Locales
        if (nombre.trim().length < 3) {
            setErrorMsg('Por favor, ingresa al menos 3 letras de tu nombre y apellido.');
            setIsSubmitting(false);
            return;
        }

        if (!telefono.trim() || telefono.trim().length < 9) {
            setErrorMsg('El número de celular es obligatorio y debe ser válido.');
            setIsSubmitting(false);
            return;
        }

        try {
            // 2. Traer todos los invitados de Supabase
            const { data: allGuests, error } = await supabase
                .from('rsvps')
                .select('id, nombre_invitado, numero_mesa, asistira, telefono');

            if (error || !allGuests) {
                setErrorMsg('No encontramos tu nombre en nuestros registros. Por favor, asegúrate de escribirlo bien o contáctate con nosotros.');
                setIsSubmitting(false);
                return;
            }

            // 3. Búsqueda Inteligente
            const normalizedInput = normalizeString(nombre);
            const inputWords = normalizedInput.split(' ').filter(w => w.length > 0);

            const matches = allGuests.filter(guest => {
                const normalizedGuestName = normalizeString(guest.nombre_invitado);
                return inputWords.every(word => normalizedGuestName.includes(word));
            });

            if (matches.length === 0) {
                setErrorMsg('No encontramos tu nombre en nuestros registros. Por favor, asegúrate de escribirlo bien o contáctate con nosotros.');
                setIsSubmitting(false);
                return;
            }

            let matchedGuest;
            if (matches.length > 1) {
                const exactMatch = matches.find(g => normalizeString(g.nombre_invitado) === normalizedInput);
                if (exactMatch) {
                    matchedGuest = exactMatch;
                } else {
                    setErrorMsg('Encontramos a varias personas que coinciden. Por favor, incluye un apellido más para ser exactos.');
                    setIsSubmitting(false);
                    return;
                }
            } else {
                matchedGuest = matches[0];
            }

            const data = matchedGuest;

            // 4. CASO A: SI YA TENÍA UN TELÉFONO REGISTRADO (CONSULTA O CAMBIO DE ESTADO)
            if (data.telefono) {
                if (data.telefono !== telefono.trim()) {
                    setErrorMsg('Esta invitación ya fue respondida previamente con un número de celular diferente. Acceso denegado.');
                    setIsSubmitting(false);
                    return;
                }
                
                // Si está volviendo a ingresar con el mismo teléfono, actualizamos su decisión
                if (data.asistira !== willAttend && !isDeadlinePassed) {
                    await supabase
                        .from('rsvps')
                        .update({ asistira: willAttend })
                        .eq('id', data.id);
                    data.asistira = willAttend;
                }

                setSubmittedData({ ...data, telefono: telefono.trim() });
                setIsRetrieval(true);
                setIsSubmitting(false);
                return;
            }

            // 5. CASO B: NUEVA RESPUESTA FUERA DE PLAZO
            if (isDeadlinePassed) {
                setErrorMsg(`El plazo para confirmar asistencia finalizó el ${rsvp.displayDeadline}. Por favor, comunícate directamente con los novios.`);
                setIsSubmitting(false);
                return;
            }

            // 6. CASO C: REGISTRO EXITOSO DENTRO DE PLAZO
            const { error: updateError } = await supabase
                .from('rsvps')
                .update({ 
                    asistira: willAttend,
                    telefono: telefono.trim() 
                })
                .eq('id', data.id); 

            if (updateError) {
                setErrorMsg('Hubo un problema al registrar tu respuesta. Por favor inténtalo de nuevo.');
                setIsSubmitting(false);
                return;
            }

            setSubmittedData({ ...data, asistira: willAttend, telefono: telefono.trim() });

        } catch (err) {
            setErrorMsg('Ocurrió un error de red. Por favor revisa tu conexión a internet.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // VISTA DE RESPUESTA REGISTRADA (ÉXITO O NO ASISTIRÁ)
    if (submittedData) {
        return (
            <section className="min-h-screen flex items-center justify-center py-20 bg-[#1a1a1a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.1)_0%,_transparent_70%)] pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                    className="relative z-10 w-full max-w-md px-4"
                >
                    {isRetrieval && (
                        <motion.div 
                            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] px-4 py-2 rounded-xl mb-4 text-center text-xs tracking-wider flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-4 h-4" /> Registro actualizado / recuperado
                        </motion.div>
                    )}

                    {submittedData.asistira ? (
                        /* TARJETA 1: CONFIRMADO (SI ASISTE - CON PASE QR) */
                        <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-[#d4af37]/30 rounded-3xl overflow-hidden shadow-2xl relative">
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#722F37] via-[#d4af37] to-[#722F37] opacity-80" />

                            <div className="bg-gradient-to-b from-[#722F37] to-[#4a1c22] p-8 text-center relative ml-2">
                                <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full border border-white/20">
                                    <span className="text-[10px] text-white uppercase tracking-widest flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Confirmado
                                    </span>
                                </div>
                                <h2 className="text-3xl font-playfair text-white mt-4 mb-1">Pase de Invitado</h2>
                                <p className="text-[#d4af37] text-xs uppercase tracking-widest">Boda de Renato & Debora</p>
                            </div>

                            <div className="p-8 text-center space-y-6 ml-2">
                                <div>
                                    <p className="text-[#faf8f3]/50 text-xs uppercase tracking-widest mb-1">Titular de la Invitación</p>
                                    <p className="text-2xl text-white font-medium">{getDisplayName(submittedData.nombre_invitado)}</p>
                                </div>

                                <div className="flex flex-col items-center justify-center py-4">
                                    <div className="p-3 bg-white rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] border-2 border-[#d4af37]/50">
                                        <QRCode 
                                            value={submittedData.id.toString()} 
                                            size={160}
                                            level="H"
                                            fgColor="#1a1a1a"
                                        />
                                    </div>
                                    <div className="mt-4 space-y-1">
                                        <p className="text-[#d4af37] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                                            <QrCode className="w-3 h-3" /> Escanear en Recepción
                                        </p>
                                        <p className="text-red-400/80 text-[9px] uppercase tracking-wider">
                                            * Pase personal de un solo uso
                                        </p>
                                    </div>
                                </div>

                                {submittedData.numero_mesa && (
                                    <div className="pt-6 border-t border-white/10">
                                        <p className="text-[#d4af37] text-xs uppercase tracking-widest mb-2">Mesa Asignada</p>
                                        <div className="inline-block px-8 py-3 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl">
                                            <p className="text-3xl font-bold text-[#d4af37]">{submittedData.numero_mesa}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* TARJETA 2: NO ASISTIRÁ (NO ASISTE - AGRADECIMIENTO SOBRIO) */
                        <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center shadow-2xl space-y-6 relative overflow-hidden">
                            <div className="w-16 h-16 bg-[#722F37]/20 border border-[#722F37]/40 rounded-full flex items-center justify-center mx-auto text-[#d4af37]">
                                <HeartOff className="w-8 h-8" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-playfair text-white">Respuesta Registrada</h2>
                                <p className="text-xs uppercase tracking-widest text-[#d4af37]">Boda de Renato & Debora</p>
                            </div>

                            <div className="py-4 border-y border-white/10 space-y-2">
                                <p className="text-lg text-white font-medium">{getDisplayName(submittedData.nombre_invitado)}</p>
                                <p className="text-xs text-[#faf8f3]/70 leading-relaxed italic">
                                    "Muchas gracias por avisarnos. Lamentamos que no puedas acompañarnos, pero agradecemos de corazón tus buenos deseos."
                                </p>
                            </div>

                            <p className="text-[10px] text-[#faf8f3]/40 uppercase tracking-widest">
                                Si tus planes cambian, puedes volver a ingresar para actualizar tu respuesta.
                            </p>
                        </div>
                    )}

                    <p className="text-center text-[#faf8f3]/50 text-xs mt-6 px-4 leading-relaxed">
                        {submittedData.asistira ? (
                            <>Toma una captura de pantalla de este pase. <br/> <span className="text-[#d4af37]">Si deseas, puedes volver a ingresar tus datos para visualizarlo.</span></>
                        ) : (
                            <span className="text-[#faf8f3]/40">Registro guardado exitosamente.</span>
                        )}
                    </p>
                </motion.div>
            </section>
        );
    }

    // VISTA DEL FORMULARIO
    return (
        <section className="py-32 bg-[#0a0a0a] relative overflow-hidden" id="rsvp">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(114,47,55,0.15)_0%,_transparent_60%)] pointer-events-none" />

            <div className="max-w-xl mx-auto px-6 relative z-10">
                <div className="text-center mb-10">
                    
                    {/* Insignia visual con la Fecha Límite */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs uppercase tracking-widest font-medium mb-6">
                        <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Confirmar antes del {rsvp.displayDeadline}</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-playfair text-[#d4af37] mb-4">Confirmar Asistencia</h2>
                    <div className="w-16 h-0.5 bg-[#722F37] mx-auto opacity-70 mb-6" />
                    
                    <p className="text-[#faf8f3]/70 font-light leading-relaxed text-sm md:text-base">
                        Ingresa tu nombre y celular para confirmar asistencia o avisarnos si no podrás acompañarnos. <br/>
                        <span className="text-[#d4af37]">Si ya respondiste, ingresa los mismos datos para consultar o cambiar tu estado.</span>
                    </p>

                    {/* Aviso si la fecha límite ya expiró */}
                    {isDeadlinePassed && (
                        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl max-w-md mx-auto flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                            <span>El plazo estándar ha finalizado ({rsvp.displayDeadline}). Solo está habilitada la consulta de respuestas previamente registradas.</span>
                        </div>
                    )}
                </div>

                <div className="space-y-6 bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="relative">
                        <label htmlFor="nombre" className="block text-xs font-semibold text-[#d4af37] mb-2 uppercase tracking-widest">
                            Nombre en la Invitación
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="text"
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a]/80 border border-white/10 text-white rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none"
                                placeholder="Ej. Juan Pérez"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="telefono" className="block text-xs font-semibold text-[#d4af37] mb-2 uppercase tracking-widest">
                            Número de Celular <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="tel"
                                id="telefono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a]/80 border border-white/10 text-white rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none"
                                placeholder="Ej. 987654321"
                                required
                            />
                        </div>
                        <p className="text-[10px] text-[#faf8f3]/40 mt-2 ml-1">Requerido como credencial para autenticar tu respuesta después.</p>
                    </div>

                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 text-red-300 bg-red-900/20 border border-red-500/20 p-4 rounded-xl"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-light leading-relaxed">{errorMsg}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* BOTONES DUALES: SÍ ASISTIRÉ / NO ASISTIRÉ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <motion.button
                            type="button"
                            onClick={() => handleProcessRSVP(true)}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-[#722F37] hover:bg-[#8b3843] text-white font-semibold text-xs tracking-[2px] uppercase rounded-xl transition-all duration-300 border border-[#722F37] hover:border-[#d4af37]/50 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-4 h-4 text-[#d4af37]" />
                                    Sí, Asistiré
                                </>
                            )}
                        </motion.button>

                        <motion.button
                            type="button"
                            onClick={() => handleProcessRSVP(false)}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs tracking-[2px] uppercase rounded-xl transition-all duration-300 border border-white/10 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <X className="w-4 h-4 text-red-400/80" />
                                    No Podré Asistir
                                </>
                            )}
                        </motion.button>
                    </div>

                </div>
            </div>
        </section>
    );
}