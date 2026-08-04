import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request) {
  try {
    const { pin } = await request.json();
    const correctPin = process.env.ADMIN_PIN || '2026';

    // 1. Validar el PIN en el SERVIDOR (Servidor de Node/Vercel)
    if (pin !== correctPin) {
      return NextResponse.json(
        { error: 'PIN de acceso incorrecto' },
        { status: 401 }
      );
    }

    // 2. Si el PIN es correcto, el servidor consulta la BD en Supabase
    const { data: rsvps, error: rsvpErr } = await supabase
      .from('rsvps')
      .select('*')
      .order('nombre_invitado', { ascending: true });

    const { data: songRequests, error: songErr } = await supabase
      .from('song_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (rsvpErr || songErr) {
      return NextResponse.json(
        { error: 'Error al consultar la base de datos' },
        { status: 500 }
      );
    }

    // 3. Devolver los datos al cliente de forma segura
    return NextResponse.json({ rsvps, songRequests });

  } catch (error) {
    return NextResponse.json(
      { error: 'Error de servidor' },
      { status: 500 }
    );
  }
}