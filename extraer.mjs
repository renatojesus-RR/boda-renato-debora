import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Reemplaza con tu Service Role Key de .env.local
const SUPABASE_URL = 'https://egebrekiaprwbmnxwlnv.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZWJyZWtpYXByd2Jtbnh3bG52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE4Nzg4MiwiZXhwIjoyMTAwNzYzODgyfQ.P9QxRsIDI4dPj9SU9bcDQqfOKL5enqJ-uq85Rk4weow';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function exportar() {
  console.log('Consultando lista de invitados...');
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('asistira', { ascending: false });

  if (error) {
    console.error('Error al consultar:', error);
    return;
  }

  // Generar CSV
  const encabezados = 'ID,Nombre,Telefono,Mesa,Asistira,EnSalon\n';
  const filas = data.map(r => 
    `"${r.id}","${r.nombre_invitado || ''}","${r.telefono || ''}","${r.numero_mesa || ''}","${r.asistira ? 'SI' : 'NO'}","${r.ingreso_confirmado ? 'SI' : 'NO'}"`
  ).join('\n');

  fs.writeFileSync('invitados_confirmados.csv', encabezados + filas, 'utf-8');
  console.log(`✅ ¡Completado! Se exportaron ${data.length} registros en "invitados_confirmados.csv"`);
}

exportar();