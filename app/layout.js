import './styles/globals.css'
import settings from './config/settings'
import { Inter, Playfair_Display, Dancing_Script } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dancing = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boda-renato-debora.vercel.app'

let metadataBaseUrl;
try {
  metadataBaseUrl = new URL(siteUrl);
} catch (error) {
  metadataBaseUrl = new URL('https://boda-renato-debora.vercel.app');
}

// Next.js automáticamente inyectará todo esto en el <head>
export const metadata = {
  title: `${settings.couple.groom.name} & ${settings.couple.bride.name} | Boda - ${settings.wedding.displayDate}`,
  description: `¡Acompáñanos a celebrar nuestra boda! ${settings.couple.groom.name} y ${settings.couple.bride.name}. ${settings.wedding.displayDate} en ${settings.venue.name}.`,
  keywords: `boda, ${settings.couple.groom.name.toLowerCase()}, ${settings.couple.bride.name.toLowerCase()}, matrimonio, RSVP`,
  authors: [{ name: `${settings.couple.groom.name} & ${settings.couple.bride.name}` }],
  creator: `${settings.couple.groom.name} & ${settings.couple.bride.name}`,
  metadataBase: metadataBaseUrl,
  
  openGraph: {
    title: `¡${settings.couple.groom.name} & ${settings.couple.bride.name} se casan!`,
    description: `Reserva la fecha. Únete a nuestra celebración el ${settings.wedding.displayDate} a las ${settings.wedding.ceremony.displayTime}.`,
    url: siteUrl,
    siteName: `${settings.couple.bride.name} & ${settings.couple.groom.name} Wedding`,
    images: [
      {
        url: '/og-image.jpg', // Asegúrate de tener esta imagen en public/
        width: 1200,
        height: 630,
        alt: `Invitación de Boda - ${settings.couple.bride.name} & ${settings.couple.groom.name}`,
        type: 'image/jpeg',
      }
    ],
    locale: 'es_PE',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: `${settings.couple.bride.name} & ${settings.couple.groom.name} - ${settings.wedding.displayDate}`,
    description: `Acompáñanos a celebrar nuestra boda. ¡Confirma tu asistencia!`,
    images: ['/og-image.jpg'],
    creator: settings.social.instagram.groom,
  },
  
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/favicon.ico' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: settings.theme.colors.primary,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}>
      <head>
        {/* Solo dejamos el Schema.org para Rich Snippets de Google. El resto lo maneja la constante "metadata" */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: `Boda de ${settings.couple.bride.name} & ${settings.couple.groom.name}`,
              startDate: `${settings.wedding.date}T${settings.wedding.ceremony.time}:00`,
              eventStatus: 'https://schema.org/EventScheduled',
              location: {
                '@type': 'Place',
                name: settings.venue.name,
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: settings.venue.address.street,
                  addressLocality: settings.venue.address.city,
                  addressCountry: settings.venue.address.country,
                }
              }
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}