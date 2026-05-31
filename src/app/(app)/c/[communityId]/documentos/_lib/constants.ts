import type { Database } from '@/types/database';

export type DocumentFolder = Database['public']['Enums']['document_folder'];

export type DocumentRow = {
  id: string;
  name: string;
  folder: DocumentFolder;
  storagePath: string;
  sizeBytes: number | null;
  mimeType: string | null;
  uploadedAt: string;
  uploadedByName: string | null;
  signedUrl: string | null;
};

export const FOLDER_META: Record<
  DocumentFolder,
  { label: string; description: string; color: string }
> = {
  actas: {
    label: 'Actas de Junta',
    description: 'Actas de reuniones y convocatorias',
    color: '#3b82f6',
  },
  estatutos: {
    label: 'Estatutos',
    description: 'Estatutos, reglamento interno y normas',
    color: '#8b5cf6',
  },
  seguros: {
    label: 'Seguros',
    description: 'Pólizas y certificados de seguros',
    color: '#10b981',
  },
  contratos: {
    label: 'Contratos',
    description: 'Contratos de servicios y proveedores',
    color: '#f59e0b',
  },
  certificados: {
    label: 'Certificados',
    description: 'Certificados oficiales y técnicos',
    color: '#ef4444',
  },
  otros: {
    label: 'Otros',
    description: 'Documentación variada',
    color: '#6b7280',
  },
};

export const VALID_FOLDERS = Object.keys(FOLDER_META) as DocumentFolder[];
