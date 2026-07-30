'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Hero from './components/Hero'
import Countdown from './components/Countdown'
import FloatingMenu from './components/FloatingMenu'
import FloatingMusicControl from './components/FloatingMusicControl'

// Lazy Loading
const WeddingDetails = dynamic(() => import('./components/WeddingDetails'))
const Gallery = dynamic(() => import('./components/Gallery'))
const SharedMoments = dynamic(() => import('./components/SharedMoments'))
const RSVPForm = dynamic(() => import('./components/RSVPForm'))
const Registry = dynamic(() => import('./components/Registry')) // <-- Importado
const Footer = dynamic(() => import('./components/Footer'))
const SongRequest = dynamic(() => import('./components/SongRequest'))

const LoadingFallback = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-[#722F37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#722F37]/60 text-sm">Cargando...</p>
    </div>
  </div>
)

export default function Home() {
  return (
    <div className="min-h-screen">
      <FloatingMenu />
      <FloatingMusicControl />
      <Hero />
      <Countdown />
      
      <Suspense fallback={<LoadingFallback />}>
        <WeddingDetails />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Gallery />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <SharedMoments />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
      <SongRequest />
      </Suspense>
      
      {/* Confirmar Asistencia primero */}
      <Suspense fallback={<LoadingFallback />}>
        <RSVPForm />
      </Suspense>

      {/* Regalos inmediatamente después de RSVP */}
      <Suspense fallback={<LoadingFallback />}>
        <Registry />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <Footer />
      </Suspense>
    </div>
  )
}