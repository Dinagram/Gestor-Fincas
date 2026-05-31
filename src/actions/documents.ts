'use server';

import { revalidatePath } from 'next/cache';

import { isAtLeast } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type DocumentFolder = Database['public']['Enums']['document_folder'];

type ActionState = { error: string | null; success: boolean };

export async function uploadDocument(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado', success: false };

  const communityId = formData.get('communityId') as string;
  const folder = formData.get('folder') as string;
  const file = formData.get('file') as File | null;

  if (!communityId || !folder || !file || file.size === 0) {
    return { error: 'Datos incompletos. Selecciona un archivo.', success: false };
  }

  const VALID_FOLDERS: DocumentFolder[] = [
    'actas', 'estatutos', 'seguros', 'contratos', 'certificados', 'otros',
  ];
  if (!VALID_FOLDERS.includes(folder as DocumentFolder)) {
    return { error: 'Carpeta no válida.', success: false };
  }

  // Verify membership and permission
  const { data: membership } = await supabase
    .from('community_members')
    .select('role')
    .eq('profile_id', user.id)
    .eq('community_id', communityId)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership || !isAtLeast(membership.role, 'junta')) {
    return { error: 'Sin permisos para subir documentos.', success: false };
  }

  // Max file size: 25 MB
  if (file.size > 25 * 1024 * 1024) {
    return { error: 'El archivo supera el límite de 25 MB.', success: false };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._\-\s]/g, '_');
  const storagePath = `${communityId}/${folder}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: `Error al subir el archivo: ${uploadError.message}`, success: false };
  }

  const { error: insertError } = await supabase.from('documents').insert({
    community_id: communityId,
    folder: folder as DocumentFolder,
    name: file.name,
    storage_path: storagePath,
    size_bytes: file.size,
    mime_type: file.type || null,
    uploaded_by: user.id,
  });

  if (insertError) {
    // Best effort cleanup of the uploaded file
    await supabase.storage.from('documents').remove([storagePath]);
    return { error: `Error al registrar el documento: ${insertError.message}`, success: false };
  }

  revalidatePath(`/c/${communityId}/documentos`);
  return { error: null, success: true };
}
