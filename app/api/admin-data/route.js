import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pin, action, guestData } = body;
    const correctPin = process.env.ADMIN_PIN || '2026';

    // 1. Validar el PIN en el Servidor
    if (pin !== correctPin) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    }

    // Inicializar cliente Admin con Service Role Key (Solo vive en el servidor)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 2. ACCIÓN: CREAR NUEVO INVITADO
    if (action === 'add_guest') {
      const { nombre, telefono, numero_mesa } = guestData;

      const { data, error } = await supabaseAdmin
        .from('rsvps')
        .insert([
          {
            nombre_invitado: nombre.trim(),
            telefono: telefono ? telefono.trim() : null,
            numero_mesa: numero_mesa ? parseInt(numero_mesa) : null,
            asistira: false,
            ingreso_confirmado: false
          }
        ])
        .select();

      if (error) {
        return NextResponse.json({ error: 'Error al insertar en la base de datos' }, { status: 500 });
      }

      return NextResponse.json({ success: true, newGuest: data[0] });
    }

    // 3. ACCIÓN DEFAULT: CONSULTAR DATOS (LOGIN / REFRESH)
    const { data: rsvps } = await supabaseAdmin
      .from('rsvps')
      .select('*')
      .order('nombre_invitado', { ascending: true });

    const { data: songRequests } = await supabaseAdmin
      .from('song_requests')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({ rsvps, songRequests });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}