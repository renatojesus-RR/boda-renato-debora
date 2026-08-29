import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Reemplaza con tus llaves reales
const SUPABASE_URL = 'https://egebrekiaprwbmnxwlnv.supabase.co';
const SERVICE_KEY = 'PEGA_AQUI_TU_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function ejecutarRespaldo() {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('asistira', { ascending: false });

  if (error) {
    console.error('Error extrayendo datos:', error);
    return;
  }

  const encabezados = 'ID,Nombre,Telefono,Mesa,Asistira,EnSalon\n';
  const filas = data.map(r => 
    `"${r.id}","${r.nombre_invitado || ''}","${r.telefono || ''}","${r.numero_mesa || ''}","${r.asistira ? 'SI' : 'NO'}","${r.ingreso_confirmado ? 'SI' : 'NO'}"`
  ).join('\n');

  // Generar marca de tiempo (ej. 2026-08-28_10-30-00)
  const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 19);
  
  // Crear directorio si no existe
  const dir = './backups';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const filename = `${dir}/rsvps_${timestamp}.csv`;
  fs.writeFileSync(filename, encabezados + filas, 'utf-8');
  console.log(`✅ Respaldo exitoso: ${filename} (${data.length} registros)`);
}

ejecutarRespaldo();