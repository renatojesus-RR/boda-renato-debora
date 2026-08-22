import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pin, action, guestData, guestId } = body;
    
    // Tu PIN maestro (recuerda que idealmente vive en tu archivo .env.local)
    const correctPin = process.env.ADMIN_PIN || '0108';

    if (pin !== correctPin) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (action === 'add_guest') {
      const { nombre, telefono, numero_mesa } = guestData;
      const { data, error } = await supabaseAdmin.from('rsvps').insert([{ nombre_invitado: nombre.trim(), telefono: telefono ? telefono.trim() : null, numero_mesa: numero_mesa ? parseInt(numero_mesa) : null, asistira: false, ingreso_confirmado: false }]).select();
      if (error) return NextResponse.json({ error: 'Error al crear invitado' }, { status: 500 });
      return NextResponse.json({ success: true, newGuest: data[0] });
    }

    if (action === 'edit_guest_name') {
      const { nombre } = guestData;
      const { data, error } = await supabaseAdmin.from('rsvps').update({ nombre_invitado: nombre.trim() }).eq('id', guestId).select();
      if (error) return NextResponse.json({ error: 'Error al actualizar nombre' }, { status: 500 });
      return NextResponse.json({ success: true, updatedGuest: data[0] });
    }
    
    if (action === 'edit_guest_table') {
      const { numero_mesa } = guestData;
      const { data, error } = await supabaseAdmin.from('rsvps').update({ numero_mesa: numero_mesa }).eq('id', guestId).select();
      if (error) return NextResponse.json({ error: 'Error al actualizar mesa' }, { status: 500 });
      return NextResponse.json({ success: true, updatedGuest: data[0] });
    }

    if (action === 'delete_guest') {
      const { error } = await supabaseAdmin.from('rsvps').delete().eq('id', guestId);
      if (error) return NextResponse.json({ error: 'Error al eliminar invitado' }, { status: 500 });
      return NextResponse.json({ success: true, deletedId: guestId });
    }

    if (action === 'check_in_guest') {
      const { data, error } = await supabaseAdmin.from('rsvps').update({ ingreso_confirmado: true }).eq('id', guestId).select();
      if (error) return NextResponse.json({ error: 'Error al procesar el ingreso' }, { status: 500 });
      return NextResponse.json({ success: true, updatedGuest: data[0] });
    }

    if (action === 'update_config') {
      const { rsvp_deadline, songs_unlocked, wa_message_confirmed, wa_message_pending } = guestData;
      const { data, error } = await supabaseAdmin.from('app_config').update({ rsvp_deadline, songs_unlocked, wa_message_confirmed, wa_message_pending }).eq('id', 1).select();
      if (error) return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
      return NextResponse.json({ success: true, updatedConfig: data[0] });
    }

    // 🔴 CMS: SUBIR IMAGEN (Asegurando que entre en la posición cero temporalmente)
    if (action === 'upload_image') {
      const { fileName, fileType, base64Data } = guestData;
      const buffer = Buffer.from(base64Data, 'base64');
      const uniqueName = `public/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      const { error: storageError } = await supabaseAdmin.storage
        .from('gallery')
        .upload(uniqueName, buffer, { contentType: fileType, upsert: false });

      if (storageError) return NextResponse.json({ error: 'Error subiendo archivo' }, { status: 500 });

      const { data: publicUrlData } = supabaseAdmin.storage.from('gallery').getPublicUrl(uniqueName);
      const url = publicUrlData.publicUrl;

      const { data: dbData, error: dbError } = await supabaseAdmin
        .from('gallery_images')
        .insert([{ url, sort_order: 0 }])
        .select();

      if (dbError) return NextResponse.json({ error: 'Error guardando URL' }, { status: 500 });
      return NextResponse.json({ success: true, newImage: dbData[0] });
    }

    // CMS: ELIMINAR IMAGEN
    if (action === 'delete_image') {
      const { id, url } = guestData;
      const urlParts = url.split('/');
      const filePath = `public/${urlParts[urlParts.length - 1]}`;
      await supabaseAdmin.storage.from('gallery').remove([filePath]);
      const { error } = await supabaseAdmin.from('gallery_images').delete().eq('id', id);
      if (error) return NextResponse.json({ error: 'Error eliminando registro' }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    // 🔴 CMS: REORDENAMIENTO DE LA GALERÍA (La solución a la falla)
    if (action === 'reorder_gallery') {
      const { reorderedPayload } = guestData; 
      
      try {
        // Envolvemos las peticiones en Promesas y exigimos éxito para no fallar en silencio
        const updatePromises = reorderedPayload.map(async (img) => {
          const { error } = await supabaseAdmin
            .from('gallery_images')
            .update({ sort_order: img.sort_order })
            .eq('id', img.id);
            
          if (error) throw error;
        });
        
        await Promise.all(updatePromises);
        return NextResponse.json({ success: true });
      } catch (err) {
        console.error("Error crítico reordenando imágenes:", err);
        return NextResponse.json({ error: 'Fallo al sincronizar el orden en la base de datos' }, { status: 500 });
      }
    }

    // 🔴 CONSULTA GENERAL DEL DASHBOARD (Garantizando el orden en pantalla)
    const { data: rsvps } = await supabaseAdmin.from('rsvps').select('*').order('nombre_invitado', { ascending: true });
    const { data: songRequests } = await supabaseAdmin.from('song_requests').select('*').order('created_at', { ascending: false });
    const { data: config } = await supabaseAdmin.from('app_config').select('*').single();
    
    // Traemos la galería leyendo estrictamente la nueva columna sort_order
    const { data: galleryImages } = await supabaseAdmin
      .from('gallery_images')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    return NextResponse.json({ rsvps, songRequests, config, galleryImages });

  } catch (error) {
    console.error("Error Global del Servidor:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}