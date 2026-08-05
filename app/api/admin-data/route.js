import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pin, action, guestData, guestId } = body;
    const correctPin = process.env.ADMIN_PIN || '2026';

    if (pin !== correctPin) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // ACCIÓN 1: AGREGAR INVITADO
    if (action === 'add_guest') {
      const { nombre, telefono, numero_mesa } = guestData;
      const { data, error } = await supabaseAdmin
        .from('rsvps')
        .insert([{
          nombre_invitado: nombre.trim(),
          telefono: telefono ? telefono.trim() : null,
          numero_mesa: numero_mesa ? parseInt(numero_mesa) : null,
          asistira: false
        }])
        .select();

      if (error) return NextResponse.json({ error: 'Error al crear invitado' }, { status: 500 });
      return NextResponse.json({ success: true, newGuest: data[0] });
    }

    // ACCIÓN 2: EDITAR NOMBRE DE INVITADO
    if (action === 'edit_guest_name') {
      const { nombre } = guestData;
      const { data, error } = await supabaseAdmin
        .from('rsvps')
        .update({ nombre_invitado: nombre.trim() })
        .eq('id', guestId)
        .select();

      if (error) return NextResponse.json({ error: 'Error al actualizar nombre' }, { status: 500 });
      return NextResponse.json({ success: true, updatedGuest: data[0] });
    }

    // ACCIÓN 3: ELIMINAR INVITADO
    if (action === 'delete_guest') {
      const { error } = await supabaseAdmin
        .from('rsvps')
        .delete()
        .eq('id', guestId);

      if (error) return NextResponse.json({ error: 'Error al eliminar invitado' }, { status: 500 });
      return NextResponse.json({ success: true, deletedId: guestId });
    }

    // CONSULTA GENERAL (LOGIN / REFRESH)
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