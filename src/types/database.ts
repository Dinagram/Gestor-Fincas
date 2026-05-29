/**
 * Placeholder Database type until `pnpm db:types` is run (which requires
 * `supabase start` to be running locally). The shape below mirrors the
 * minimum schema needed for the Incidencias module to type-check.
 *
 * AFTER running `pnpm db:types` this file will be overwritten with the
 * full, generated typings.
 */

export type Database = {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string;
          name: string;
          address: string;
          cif: string | null;
          postal_code: string | null;
          city: string | null;
          province: string | null;
          plan: 'free' | 'pro' | 'enterprise';
          settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['communities']['Row']> & {
          name: string;
          address: string;
        };
        Update: Partial<Database['public']['Tables']['communities']['Row']>;
        Relationships: [];
      };
      units: {
        Row: {
          id: string;
          community_id: string;
          floor: string;
          door: string;
          type: 'vivienda' | 'local' | 'garaje' | 'trastero';
          surface_m2: number | null;
          coefficient: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['units']['Row']> & {
          community_id: string;
          floor: string;
          door: string;
        };
        Update: Partial<Database['public']['Tables']['units']['Row']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          language: string;
          notifications_settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          profile_id: string;
          unit_id: string | null;
          role: 'superadmin' | 'admin_finca' | 'junta' | 'propietario' | 'inquilino';
          status: 'active' | 'invited' | 'inactive';
          invited_by: string | null;
          invited_at: string | null;
          joined_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['community_members']['Row']> & {
          community_id: string;
          profile_id: string;
          role: Database['public']['Tables']['community_members']['Row']['role'];
        };
        Update: Partial<Database['public']['Tables']['community_members']['Row']>;
        Relationships: [];
      };
      issues: {
        Row: {
          id: string;
          community_id: string;
          code: string;
          title: string;
          description: string | null;
          category:
            | 'ascensor'
            | 'fontaneria'
            | 'electricidad'
            | 'limpieza'
            | 'ruido'
            | 'seguridad'
            | 'jardineria'
            | 'obras'
            | 'otros';
          priority: 'baja' | 'media' | 'alta' | 'urgente';
          status:
            | 'abierta'
            | 'en_revision'
            | 'en_curso'
            | 'resuelta'
            | 'cerrada'
            | 'descartada';
          location: string | null;
          created_by: string;
          assigned_to: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['issues']['Row']> & {
          community_id: string;
          title: string;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['issues']['Row']>;
        Relationships: [];
      };
      issue_comments: {
        Row: {
          id: string;
          issue_id: string;
          community_id: string;
          author_id: string | null;
          body: string;
          is_system: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['issue_comments']['Row']> & {
          issue_id: string;
          community_id: string;
          body: string;
        };
        Update: Partial<Database['public']['Tables']['issue_comments']['Row']>;
        Relationships: [];
      };
      issue_attachments: {
        Row: {
          id: string;
          issue_id: string;
          comment_id: string | null;
          community_id: string;
          uploader_id: string | null;
          storage_path: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['issue_attachments']['Row']> & {
          issue_id: string;
          community_id: string;
          storage_path: string;
          file_name: string;
        };
        Update: Partial<Database['public']['Tables']['issue_attachments']['Row']>;
        Relationships: [];
      };
      issue_status_history: {
        Row: {
          id: string;
          issue_id: string;
          community_id: string;
          from_status: Database['public']['Tables']['issues']['Row']['status'] | null;
          to_status: Database['public']['Tables']['issues']['Row']['status'];
          changed_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      issue_supports: {
        Row: {
          issue_id: string;
          profile_id: string;
          community_id: string;
          created_at: string;
        };
        Insert: Database['public']['Tables']['issue_supports']['Row'];
        Update: Partial<Database['public']['Tables']['issue_supports']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_member: { Args: { _community: string }; Returns: boolean };
      has_role: {
        Args: {
          _community: string;
          _role: Database['public']['Tables']['community_members']['Row']['role'];
        };
        Returns: boolean;
      };
      is_admin_or_junta: { Args: { _community: string }; Returns: boolean };
      current_member_role: {
        Args: { _community: string };
        Returns: Database['public']['Tables']['community_members']['Row']['role'];
      };
    };
    Enums: {
      member_role: Database['public']['Tables']['community_members']['Row']['role'];
      issue_status: Database['public']['Tables']['issues']['Row']['status'];
      issue_priority: Database['public']['Tables']['issues']['Row']['priority'];
      issue_category: Database['public']['Tables']['issues']['Row']['category'];
    };
  };
};
