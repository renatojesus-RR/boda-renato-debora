💍 Boda de Renato & Debora
Invitación de boda digital interactiva y sistema de gestión de asistencia (RSVP) desarrollado para la celebración de Renato y Debora.

📅 Detalles del Evento
Fecha: 04 de septiembre de 2026
Ceremonia Religiosa: Parroquia Santísimo Redentor (Calle Ernesto Mora 421, San Martín de Porres) - 8:00 PM
Recepción y Fiesta: Hollywood Salón de Recepciones (Jr. Manuel Gonzales Prada 105, Los Olivos) - 10:00 PM
Brindis Oficial: 10:30 PM
Cena: 11:30 PM

🚀 Tecnologías Utilizadas
Framework: Next.js (App Router)
Estilos: Tailwind CSS
Animaciones: Framer Motion
Base de Datos & Backend: Supabase (Gestión de invitados y confirmación de asistencia en tiempo real)
Iconos: Lucide React
Despliegue: Vercel

🛠️ Configuración y Ejecución Local
Sigue estos pasos para levantar el proyecto en tu entorno local:

Clonar el repositorio:

Bash
git clone https://github.com/renatojesus-RR/boda-renato-debora.git
cd boda-renato-debora
Instalar las dependencias:

Bash
npm install
Configurar las variables de entorno:
Crea un archivo llamado .env.local en la raíz del proyecto y añade tus credenciales de Supabase:

Fragmento de código
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
Ejecutar el servidor de desarrollo:

Bash
npm run dev
Abre http://localhost:3000 en tu navegador para ver la aplicación funcionando.

📂 Estructura de la Base de Datos (Supabase)
La aplicación utiliza una tabla llamada rsvps con la siguiente estructura:

id (UUID - Primary Key)
nombre_invitado (Text)
asistira (Boolean)
numero_mesa (Text)
telefono (Text)

✒️ Autor
Diseñado y desarrollado con amor para nuestro gran día por Renato Rodriguez.