import { requireMember } from '@/lib/auth/require-user';
import { isAtLeast } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';

import { FolderContent } from './_components/folder-content';
import { FolderGrid } from './_components/folder-grid';
import type { DocumentFolder, DocumentRow } from './_lib/constants';
import { VALID_FOLDERS } from './_lib/constants';

type Params = Promise<{ communityId: string }>;
type Search = Promise<{ folder?: string }>;

export default async function DocumentosPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { communityId } = await params;
  const { folder: folderParam } = await searchParams;
  const { role } = await requireMember(communityId);

  const activeFolder =
    folderParam && (VALID_FOLDERS as string[]).includes(folderParam)
      ? (folderParam as DocumentFolder)
      : null;

  const supabase = await createServerClient();
  const canUpload = isAtLeast(role, 'junta');

  if (activeFolder) {
    const { data: docs } = await supabase
      .from('documents')
      .select(
        'id, name, folder, storage_path, size_bytes, mime_type, uploaded_at, profiles(full_name)',
      )
      .eq('community_id', communityId)
      .eq('folder', activeFolder)
      .order('uploaded_at', { ascending: false });

    const rows: DocumentRow[] = await Promise.all(
      (docs ?? []).map(async (doc) => {
        const rawProfile = doc.profiles;
        const profile = rawProfile
          ? Array.isArray(rawProfile)
            ? rawProfile[0]
            : rawProfile
          : null;
        let signedUrl: string | null = null;
        try {
          const { data } = await supabase.storage
            .from('documents')
            .createSignedUrl(doc.storage_path, 3600);
          signedUrl = data?.signedUrl ?? null;
        } catch {
          // Storage bucket may not be configured in local dev
        }
        return {
          id: doc.id,
          name: doc.name,
          folder: doc.folder,
          storagePath: doc.storage_path,
          sizeBytes: doc.size_bytes,
          mimeType: doc.mime_type,
          uploadedAt: doc.uploaded_at,
          uploadedByName: profile?.full_name ?? null,
          signedUrl,
        };
      }),
    );

    return (
      <div className="container space-y-6 p-6">
        <FolderContent
          communityId={communityId}
          folder={activeFolder}
          documents={rows}
          canUpload={canUpload}
        />
      </div>
    );
  }

  // Grid view: count documents per folder
  const { data: countData } = await supabase
    .from('documents')
    .select('folder')
    .eq('community_id', communityId);

  const counts = new Map<DocumentFolder, number>();
  for (const row of countData ?? []) {
    counts.set(row.folder, (counts.get(row.folder) ?? 0) + 1);
  }

  return (
    <div className="container space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documentos</h1>
          <p className="text-sm text-muted-foreground">
            Repositorio de documentación de la comunidad
          </p>
        </div>
      </header>

      <FolderGrid communityId={communityId} counts={counts} />
    </div>
  );
}
