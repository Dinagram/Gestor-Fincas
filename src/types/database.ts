export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      announcement_reads: {
        Row: {
          acknowledged_at: string | null
          acknowledged_from_ip: unknown
          announcement_id: string
          community_id: string
          profile_id: string
          read_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_from_ip?: unknown
          announcement_id: string
          community_id: string
          profile_id: string
          read_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_from_ip?: unknown
          announcement_id?: string
          community_id?: string
          profile_id?: string
          read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          body: string
          community_id: string
          created_at: string
          id: string
          requires_ack: boolean
          sent_at: string
          sent_by: string | null
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
        }
        Insert: {
          body: string
          community_id: string
          created_at?: string
          id?: string
          requires_ack?: boolean
          sent_at?: string
          sent_by?: string | null
          title: string
          type?: Database["public"]["Enums"]["announcement_type"]
        }
        Update: {
          body?: string
          community_id?: string
          created_at?: string
          id?: string
          requires_ack?: boolean
          sent_at?: string
          sent_by?: string | null
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "announcements_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          color: string | null
          community_id: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          color?: string | null
          community_id: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          color?: string | null
          community_id?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_entries: {
        Row: {
          amount_eur: number
          category_id: string | null
          community_id: string
          created_at: string
          description: string | null
          entry_date: string
          id: string
          kind: Database["public"]["Enums"]["budget_kind"]
          month: number | null
          source: string
          year: number
        }
        Insert: {
          amount_eur: number
          category_id?: string | null
          community_id: string
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          kind: Database["public"]["Enums"]["budget_kind"]
          month?: number | null
          source?: string
          year: number
        }
        Update: {
          amount_eur?: number
          category_id?: string | null
          community_id?: string
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          kind?: Database["public"]["Enums"]["budget_kind"]
          month?: number | null
          source?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_entries_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_imports: {
        Row: {
          community_id: string
          file_path: string
          id: string
          imported_at: string
          imported_by: string | null
          rows_imported: number | null
          status: string
        }
        Insert: {
          community_id: string
          file_path: string
          id?: string
          imported_at?: string
          imported_by?: string | null
          rows_imported?: number | null
          status?: string
        }
        Update: {
          community_id?: string
          file_path?: string
          id?: string
          imported_at?: string
          imported_by?: string | null
          rows_imported?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_imports_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_imports_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          address: string
          cif: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          plan: Database["public"]["Enums"]["plan_tier"]
          postal_code: string | null
          province: string | null
          settings: Json
          updated_at: string
        }
        Insert: {
          address: string
          cif?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          postal_code?: string | null
          province?: string | null
          settings?: Json
          updated_at?: string
        }
        Update: {
          address?: string
          cif?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          postal_code?: string | null
          province?: string | null
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      community_counters: {
        Row: {
          community_id: string
          last_value: number
          scope: string
        }
        Insert: {
          community_id: string
          last_value?: number
          scope: string
        }
        Update: {
          community_id?: string
          last_value?: number
          scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_counters_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          profile_id: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["member_status"]
          unit_id: string | null
        }
        Insert: {
          community_id: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          profile_id: string
          role: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          unit_id?: string | null
        }
        Update: {
          community_id?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          profile_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          community_id: string
          folder: Database["public"]["Enums"]["document_folder"]
          id: string
          mime_type: string | null
          name: string
          size_bytes: number | null
          storage_path: string
          uploaded_at: string
          uploaded_by: string | null
          year: number | null
        }
        Insert: {
          community_id: string
          folder?: Database["public"]["Enums"]["document_folder"]
          id?: string
          mime_type?: string | null
          name: string
          size_bytes?: number | null
          storage_path: string
          uploaded_at?: string
          uploaded_by?: string | null
          year?: number | null
        }
        Update: {
          community_id?: string
          folder?: Database["public"]["Enums"]["document_folder"]
          id?: string
          mime_type?: string | null
          name?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          community_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["member_role"]
          token: string
          unit_id: string | null
          used_at: string | null
        }
        Insert: {
          community_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["member_role"]
          token?: string
          unit_id?: string | null
          used_at?: string | null
        }
        Update: {
          community_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          token?: string
          unit_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_attachments: {
        Row: {
          comment_id: string | null
          community_id: string
          created_at: string
          file_name: string
          id: string
          issue_id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          uploader_id: string | null
        }
        Insert: {
          comment_id?: string | null
          community_id: string
          created_at?: string
          file_name: string
          id?: string
          issue_id: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          uploader_id?: string | null
        }
        Update: {
          comment_id?: string | null
          community_id?: string
          created_at?: string
          file_name?: string
          id?: string
          issue_id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_attachments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "issue_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_attachments_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_attachments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_attachments_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_comments: {
        Row: {
          author_id: string | null
          body: string
          community_id: string
          created_at: string
          id: string
          is_system: boolean
          issue_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          community_id: string
          created_at?: string
          id?: string
          is_system?: boolean
          issue_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          community_id?: string
          created_at?: string
          id?: string
          is_system?: boolean
          issue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_comments_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_status_history: {
        Row: {
          changed_by: string | null
          community_id: string
          created_at: string
          from_status: Database["public"]["Enums"]["issue_status"] | null
          id: string
          issue_id: string
          note: string | null
          to_status: Database["public"]["Enums"]["issue_status"]
        }
        Insert: {
          changed_by?: string | null
          community_id: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["issue_status"] | null
          id?: string
          issue_id: string
          note?: string | null
          to_status: Database["public"]["Enums"]["issue_status"]
        }
        Update: {
          changed_by?: string | null
          community_id?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["issue_status"] | null
          id?: string
          issue_id?: string
          note?: string | null
          to_status?: Database["public"]["Enums"]["issue_status"]
        }
        Relationships: [
          {
            foreignKeyName: "issue_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_status_history_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_status_history_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_supports: {
        Row: {
          community_id: string
          created_at: string
          issue_id: string
          profile_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          issue_id: string
          profile_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          issue_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_supports_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_supports_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_supports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["issue_category"]
          code: string
          community_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          location: string | null
          priority: Database["public"]["Enums"]["issue_priority"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["issue_category"]
          code: string
          community_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          location?: string | null
          priority?: Database["public"]["Enums"]["issue_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["issue_category"]
          code?: string
          community_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          location?: string | null
          priority?: Database["public"]["Enums"]["issue_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          id: string
          label: string
          order: number
          poll_id: string
        }
        Insert: {
          id?: string
          label: string
          order?: number
          poll_id: string
        }
        Update: {
          id?: string
          label?: string
          order?: number
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_participants: {
        Row: {
          community_id: string
          poll_id: string
          profile_id: string
          weight: number
        }
        Insert: {
          community_id: string
          poll_id: string
          profile_id: string
          weight?: number
        }
        Update: {
          community_id?: string
          poll_id?: string
          profile_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_participants_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_participants_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          choice: Database["public"]["Enums"]["vote_choice"] | null
          community_id: string
          option_id: string | null
          poll_id: string
          profile_id: string
          voted_at: string
          weight: number
        }
        Insert: {
          choice?: Database["public"]["Enums"]["vote_choice"] | null
          community_id: string
          option_id?: string | null
          poll_id: string
          profile_id: string
          voted_at?: string
          weight?: number
        }
        Update: {
          choice?: Database["public"]["Enums"]["vote_choice"] | null
          community_id?: string
          option_id?: string | null
          poll_id?: string
          profile_id?: string
          voted_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          amount: number | null
          community_id: string
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string
          id: string
          quorum_percent: number
          starts_at: string
          status: Database["public"]["Enums"]["poll_status"]
          title: string
          type: Database["public"]["Enums"]["poll_type"]
          updated_at: string
        }
        Insert: {
          amount?: number | null
          community_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at: string
          id?: string
          quorum_percent?: number
          starts_at: string
          status?: Database["public"]["Enums"]["poll_status"]
          title: string
          type: Database["public"]["Enums"]["poll_type"]
          updated_at?: string
        }
        Update: {
          amount?: number | null
          community_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          quorum_percent?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["poll_status"]
          title?: string
          type?: Database["public"]["Enums"]["poll_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          language: string
          notifications_settings: Json
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          language?: string
          notifications_settings?: Json
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string
          notifications_settings?: Json
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      room_booking_participants: {
        Row: {
          booking_id: string
          community_id: string
          created_at: string
          guest_name: string | null
          id: string
          profile_id: string | null
        }
        Insert: {
          booking_id: string
          community_id: string
          created_at?: string
          guest_name?: string | null
          id?: string
          profile_id?: string | null
        }
        Update: {
          booking_id?: string
          community_id?: string
          created_at?: string
          guest_name?: string | null
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_booking_participants_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "room_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_booking_participants_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_booking_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_booking_rules: {
        Row: {
          community_id: string
          created_at: string
          id: string
          max_attendees: number | null
          max_duration_hours: number
          max_per_unit_per_month: number
          min_advance_hours: number
          room_id: string
          rules_text: string | null
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          max_attendees?: number | null
          max_duration_hours?: number
          max_per_unit_per_month?: number
          min_advance_hours?: number
          room_id: string
          rules_text?: string | null
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          max_attendees?: number | null
          max_duration_hours?: number
          max_per_unit_per_month?: number
          min_advance_hours?: number
          room_id?: string
          rules_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_booking_rules_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_booking_rules_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_bookings: {
        Row: {
          attendees: number | null
          cancel_reason: string | null
          cancelled_at: string | null
          category: Database["public"]["Enums"]["booking_category"]
          community_id: string
          created_at: string
          created_by: string
          ends_at: string
          id: string
          kind: Database["public"]["Enums"]["booking_kind"]
          purpose: string
          room_id: string
          rules_accepted_at: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          attendees?: number | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          category?: Database["public"]["Enums"]["booking_category"]
          community_id: string
          created_at?: string
          created_by: string
          ends_at: string
          id?: string
          kind?: Database["public"]["Enums"]["booking_kind"]
          purpose: string
          room_id: string
          rules_accepted_at?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          attendees?: number | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          category?: Database["public"]["Enums"]["booking_category"]
          community_id?: string
          created_at?: string
          created_by?: string
          ends_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["booking_kind"]
          purpose?: string
          room_id?: string
          rules_accepted_at?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_bookings_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_bookings_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number
          close_hour: number
          community_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          open_hour: number
          out_of_service_reason: string | null
          requires_approval: boolean
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          capacity?: number
          close_hour?: number
          community_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          open_hour?: number
          out_of_service_reason?: string | null
          requires_approval?: boolean
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          capacity?: number
          close_hour?: number
          community_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          open_hour?: number
          out_of_service_reason?: string | null
          requires_approval?: boolean
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          coefficient: number
          community_id: string
          created_at: string
          door: string
          floor: string
          id: string
          surface_m2: number | null
          type: Database["public"]["Enums"]["unit_type"]
        }
        Insert: {
          coefficient?: number
          community_id: string
          created_at?: string
          door: string
          floor: string
          id?: string
          surface_m2?: number | null
          type?: Database["public"]["Enums"]["unit_type"]
        }
        Update: {
          coefficient?: number
          community_id?: string
          created_at?: string
          door?: string
          floor?: string
          id?: string
          surface_m2?: number | null
          type?: Database["public"]["Enums"]["unit_type"]
        }
        Relationships: [
          {
            foreignKeyName: "units_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_vote_economic: { Args: { _community: string }; Returns: boolean }
      current_member_role: {
        Args: { _community: string }
        Returns: Database["public"]["Enums"]["member_role"]
      }
      has_role: {
        Args: {
          _community: string
          _role: Database["public"]["Enums"]["member_role"]
        }
        Returns: boolean
      }
      is_admin_or_junta: { Args: { _community: string }; Returns: boolean }
      is_member: { Args: { _community: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      storage_community_id: { Args: { _name: string }; Returns: string }
    }
    Enums: {
      announcement_type: "aviso" | "convocatoria" | "resolucion" | "urgente"
      booking_category: "reunion" | "cumpleanos" | "deporte" | "taller" | "otro"
      booking_kind: "vecino" | "comunidad" | "bloqueo"
      booking_status: "pendiente" | "confirmada" | "cancelada" | "completada"
      budget_kind: "presupuestado" | "ejecutado"
      document_folder:
        | "actas"
        | "estatutos"
        | "seguros"
        | "contratos"
        | "certificados"
        | "otros"
      issue_category:
        | "ascensor"
        | "fontaneria"
        | "electricidad"
        | "limpieza"
        | "ruido"
        | "seguridad"
        | "jardineria"
        | "obras"
        | "otros"
      issue_priority: "baja" | "media" | "alta" | "urgente"
      issue_status:
        | "abierta"
        | "en_revision"
        | "en_curso"
        | "resuelta"
        | "cerrada"
        | "descartada"
      member_role:
        | "superadmin"
        | "admin_finca"
        | "junta"
        | "propietario"
        | "inquilino"
      member_status: "active" | "invited" | "inactive"
      plan_tier: "free" | "pro" | "enterprise"
      poll_status: "draft" | "active" | "closed" | "cancelled"
      poll_type: "binary" | "multiple" | "budget"
      room_status: "disponible" | "fuera_servicio"
      unit_type: "vivienda" | "local" | "garaje" | "trastero"
      vote_choice: "favor" | "contra" | "abstencion"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      announcement_type: ["aviso", "convocatoria", "resolucion", "urgente"],
      booking_category: ["reunion", "cumpleanos", "deporte", "taller", "otro"],
      booking_kind: ["vecino", "comunidad", "bloqueo"],
      booking_status: ["pendiente", "confirmada", "cancelada", "completada"],
      budget_kind: ["presupuestado", "ejecutado"],
      document_folder: [
        "actas",
        "estatutos",
        "seguros",
        "contratos",
        "certificados",
        "otros",
      ],
      issue_category: [
        "ascensor",
        "fontaneria",
        "electricidad",
        "limpieza",
        "ruido",
        "seguridad",
        "jardineria",
        "obras",
        "otros",
      ],
      issue_priority: ["baja", "media", "alta", "urgente"],
      issue_status: [
        "abierta",
        "en_revision",
        "en_curso",
        "resuelta",
        "cerrada",
        "descartada",
      ],
      member_role: [
        "superadmin",
        "admin_finca",
        "junta",
        "propietario",
        "inquilino",
      ],
      member_status: ["active", "invited", "inactive"],
      plan_tier: ["free", "pro", "enterprise"],
      poll_status: ["draft", "active", "closed", "cancelled"],
      poll_type: ["binary", "multiple", "budget"],
      room_status: ["disponible", "fuera_servicio"],
      unit_type: ["vivienda", "local", "garaje", "trastero"],
      vote_choice: ["favor", "contra", "abstencion"],
    },
  },
} as const

