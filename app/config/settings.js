// Configuración Principal de la Boda
const settings = {
  theme: {
    colors: {
      primary: '#722F37', // Color Vino
      secondary: '#ffffff', // Blanco
      accent: '#d4af37', // Dorado sutil
      dark: '#1a1a1a',
      darker: '#0a0a0a',
      light: '#f9f9f9',
      white: '#ffffff',
      overlay: 'rgba(114, 47, 55, 0.85)', 
      text: { primary: '#1a1a1a', secondary: '#722F37', light: '#ffffff' }
    },
    animations: { duration: { fast: 0.3, medium: 0.5, slow: 1.0, verySlow: 1.5 }, easing: 'easeInOut' }
  },

  couple: {
    bride: { name: "Debora", fullName: "Debora", email: "deborajudith02@gmail.com", phone: "+51 998 000 210" },
    groom: { name: "Renato", fullName: "Renato Rodríguez Rantes", email: "renatojesus.rod@gmail.com", phone: "+51 901 416 331" }
  },

  wedding: {
    date: "2026-09-04",
    displayDate: "04 de setiembre de 2026",
    ceremony: { time: "19:30", displayTime: "7:30 PM" },
    reception: { endTime: "06:00", displayTime: "10:00 PM" }
  },

  venue: {
    // --- DATOS GLOBALES QUE REQUIERE layout.js PARA EL SEO/METADATOS ---
    name: "Parroquia Santísimo Redentor & Hollywood Salón",
    address: {
      street: "Calle Ernesto Mora 421 / Jr. Manuel Gonzales Prada 105",
      district: "SMP / Los Olivos",
      city: "Lima",
      postalCode: "Lima 31",
      country: "Perú"
    },
    coordinates: { lat: -12.022, lng: -77.055 },

    // --- DATOS ESPECÍFICOS PARA LAS PESTAÑAS DINÁMICAS DE WeddingDetails.jsx ---
    ceremony: {
      name: "Parroquia Santísimo Redentor",
      address: "Calle Ernesto Mora 421",
      district: "San Martín de Porres, Urb. Ingeniería",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.13840251842!2d-77.0526!3d-12.0195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDAxJzEwLjIiUyA3N8KwMDMnMDkuNCJX!5e0!3m2!1ses-419!2spe!4v1620000000000!5m2!1ses-419!2spe",
      mapLink: "https://www.google.com/maps/search/?api=1&query=Parroquia+Santisimo+Redentor+San+Martin+de+Porres",
      heroImage: "/images/parroquia.jpg"
    },
    reception: {
      name: "Hollywood Salón de Recepciones",
      address: "Jr. Manuel Gonzales Prada 105",
      district: "Los Olivos",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.5000000000!2d-77.0760!3d-11.9930!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDU5JzM0LjgiUyA3N8KwMDQnMzMuNiJX!5e0!3m2!1ses-419!2spe!4v1620000000000!5m2!1ses-419!2spe",
      mapLink: "https://www.google.com/maps/search/?api=1&query=Hollywood+Salon+de+Recepciones+Los+Olivos",
      heroImage: "/images/hollywood.jpg"
    }
  },

  events: {
    ceremony: { 
      title: "Ceremonia Religiosa",
      dressCode: "Elegante / Formal",
      colors: ["Vino", "Blanco"],
      notes: [
        "Se agradece puntualidad."
      ]
    },
    reception: { 
      title: "Recepción y Fiesta",
      dressCode: "Elegante / Formal",
      colors: ["Vino", "Blanco"],
      notes: [
        "Presentar pase digital en puerta.",
        "Contamos con seguridad privada.",
        "Estacionamiento disponible en los alrededores.",
        "Recepción exclusiva para adultos (bebés lactantes bienvenidos)."
      ]
    }
  },

  timeline: [
    { time: "7:30 PM", title: "La Ceremonia", description: "Inicio de la ceremonia en la Parroquia Santísimo Redentor." },
    { time: "9:30 PM", title: "Fin del Rito", description: "Conclusión de la ceremonia." },
    { time: "10:00 PM", title: "La Recepción", description: "Transición e inicio de la recepción en Hollywood Salón." },
    { time: "10:30 PM", title: "Brindis de Honor", description: "Palabras oficiales y sesión de fotos con los novios." },
    { time: "11:30 PM", title: "La Cena", description: "Cena servida para todos nuestros invitados." },
    { time: "12:00 AM", title: "¡A Bailar!", description: "Apertura de la pista de baile y comienzo de la fiesta." },
    { time: "6:00 AM", title: "Fin de Fiesta", description: "Cierre del local y despedida." }
  ],

  rsvp: { 
    deadline: "2026-08-15",               // Fecha para evaluación técnica YYYY-MM-DD
    displayDeadline: "15 de agosto de 2026" // Texto legible que se muestra al usuario
  },

 gallery: [
    { 
      url: "/images/gallery/1.jpeg", 
      title: "TBD", 
      description: "",
      date: ""
    },
    { 
      url: "/images/gallery/2.jpeg", 
      title: "TBD", 
      description: "",
      date: ""
    },
    { 
      url: "/images/gallery/3.jpeg", 
      title: "TBD", 
      description: "",
      date: ""
    },
    { 
      url: "/images/gallery/4.jpeg", 
      title: "TBD", 
      description: "",
      date: ""
    },
    { 
      url: "/images/gallery/5.jpeg", 
      title: "TBD", 
      description: "",
      date: ""
    },
    { 
      url: "/images/gallery/6.jpeg", 
      title: "TBD", 
      description: "",
      date: ""
    },
    { 
      url: "/images/gallery/7.jpeg", 
      title: "TBD", 
      description: "",
      date: ""
    },
    { 
      url: "/images/gallery/8.jpeg", 
      title: "TBD", 
      description: "",
      date: ""
    },
    { 
      url: "/images/gallery/9.jpeg", 
      title: "TBD", 
      description: "",
      date: ""
    }
    // Puedes agregar tantas fotos como desees aquí.
  ],

  loveStory: [
    { date: "Octubre 2020", title: "Cómo nos conocimos", description: "El inicio de nuestra historia..." },
    { date: "Diciembre 2023", title: "El Compromiso", description: "Diciendo que sí para siempre..." }
  ],

  sharedMoments: {
    enabled: true,
    title: "Captura el Momento",
    subtitle: "Sé nuestro fotógrafo",
    message: "Historias reales, momentos eternos. Deja tu huella en nuestro álbum y celebremos la gracia de estar juntos.",
    buttonText: "Subir Fotos / Videos",
    driveUrl: "https://forms.gle/ABv88FqtgfGCY1EA7", // Aquí pondrás el link corto de tu Google Form
    qrImage: "/images/qr-code.png" // Puedes generar un QR de ese link y guardarlo en public/images/
  },
  
  social: {
    hashtag: "#RenatoYDebora2026",
    instagram: {
      groom: "https://www.instagram.com/bourb0n__/",
      bride: "https://www.instagram.com/babby_gvrl2/"
    }
  },

  registry: {
    enabled: true,
    title: "Muestras de Cariño",
    subtitle: "Mesa de Regalos & Lluvia de Sobres",
    message: "El mejor regalo para nosotros es contar con tu presencia en este día tan especial. Sin embargo, si deseas hacernos un presente, ponemos a tu disposición las siguientes opciones:",
    
    // Cuentas bancarias y Yape
    banks: [
      {
        name: "Plin",
        holder: "Renato Rodriguez",
        number: "901 416 331",
        qrImage: "/images/qr-plin.png", // Opción de poner la imagen del QR en public/images/
        badge: "Billetera Digital"
      },
      {
        name: "Yape",
        holder: "Debora Cabra",
        number: "998 000 210",
        qrImage: "/images/qr-yape.png", // Opción de poner la imagen del QR en public/images/
        badge: "Billetera Digital"
      },
      {
        name: "BBVA Soles",
        holder: "Renato Rodríguez",
        accountNumber: "0011-0579-0210096522", // Reemplazar
        cci: "011-579-000210096522-03",       // Reemplazar
        badge: "Cuenta de Ahorros"
      },
      {
        name: "BCP Soles", // Opcional, puedes agregar más o borrar este bloque
        holder: "Debora Cabra",
        accountNumber: "193-93767144-0-84",
        cci: "002-193-193767144084-12",
        badge: "Cuenta de Ahorros"
      }
    ],

    // Dirección para entrega presencial o regalos físicos
    physical: {
      title: "Entrega Física",
      subtitle: "Mesa de Regalos & Sobre Presencial",
      description: "Si prefieres hacernos llegar un detalle físico o sobre presencial, puedes enviarlo o llevarlo a cualquiera de nuestras direcciones:",
      addresses: [
        {
          label: "Casa del Novio (Renato)",
          street: "Av. Marco Polo 1480, Urb. Fiori",
          district: "San Martín de Porres, Lima",
          notes: "Horario de recepción coordinar previa llamada"
        },
        {
          label: "Casa de la Novia (Debora)",
          street: "Av. Miguel Angel 271, Urb. Fiori", // <-- REEMPLAZAR
          district: "San Martín de Porres, Lima",             // <-- REEMPLAZAR
          notes: "Horario de recepción coordinar previa llamada"
        }
      ]
    }
  },

  songRequest: {
    enabled: true,
    forceShow: false, // 👈 Ponlo en 'true' para probarlo HOY. En 'false' para que se active solo 24h antes.
    title: "Sugerir Canción",
    subtitle: "La Playlist de la Fiesta",
    message: "¿Qué temas no pueden faltar en la pista de baile? Déjanos tus recomendaciones para el DJ."
  },

  contact: {
    weddingPlanner: { name: "Renato y Debora", phone: "+51 901 416 331", email: "renatojesus.rod@gmail.com" },
    photographer: { name: "Por definir", instagram: "" }
  },

  admin: {
    pin: "0108",
  }

};



export default settings;