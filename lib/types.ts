/**
 * Shared TypeScript Types and Interfaces
 * Generated from database schema
 */

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  user_id: number;
  first_name: string;
  mid_name?: string;
  last_name: string;
  email: string;
  telephone?: string;
  password_hash: string;
  role?: string;
  created_at: string;
  last_login?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  first_name: string;
  mid_name?: string;
  last_name: string;
  email: string;
  telephone?: string;
  password: string;
}

// ─── Admins ───────────────────────────────────────────────────────────────────

export interface Admin {
  admin_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role?: string;
  created_at: string;
}

// ─── Diseases ─────────────────────────────────────────────────────────────────

export interface Disease {
  disease_id: number;
  name: string;
  description?: string;
  urgency_level?: string;
  image_url?: string;
}

export interface DiseaseRequirement {
  id: number;
  disease_id: number;
  label: string;
  value: string;
  icon_name?: string;
  color_hex?: string;
}

export interface DiseaseData {
  id: string;
  name: string;
  urgency: 'High Urgency' | 'Medium Urgency' | 'Low Urgency' | "Wasn't able to detect issue";
  image: string;
  urgencyClass: string;
}

// ─── Scans ────────────────────────────────────────────────────────────────────

export interface Scan {
  scan_id: number;
  user_id: number;
  disease_id?: number;
  image_url: string;
  custom_label?: string;
  confidence_score?: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface History {
  history_id: number;
  user_id: number;
  scan_id: number;
  viewed_at: string;
}

// Scan + Disease joined — useful for displaying history/results
export interface ScanWithDisease extends Scan {
  disease?: Disease;
}

export interface HistoryWithScan extends History {
  scan?: ScanWithDisease;
}

// ─── Experts ──────────────────────────────────────────────────────────────────

export interface Expert {
  expert_id: number;
  first_name: string;
  mid_name?: string;
  last_name: string;
  email: string;
  telephone?: string;
  password_hash: string;
  specialization?: string;
  organization?: string;
  bio?: string;
  years_experienced?: number;
  license_id?: string;
  is_verified: boolean;
  rating?: number;
  created_at: string;
}

// ─── Consultations ────────────────────────────────────────────────────────────

export type ConsultationPriority = 'low' | 'medium' | 'high';
export type ConsultationStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Consultation {
  consult_id: number;
  user_id: number;
  scan_id?: number;
  expert_id?: number;
  subject: string;
  description?: string;
  priority?: ConsultationPriority;
  status?: ConsultationStatus;
  resolution_note?: string;
  created_at: string;
  updated_at: string;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'image' | 'file';

export interface Message {
  message_id: number;
  consultation_id: number;
  sender_id: number;
  content: string;
  message_type?: MessageType;
  is_read: boolean;
  created_at: string;
}

// ─── API Utilities ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Form Utilities ───────────────────────────────────────────────────────────

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState {
  isSubmitting: boolean;
  errors: FormFieldError[];
  success: boolean;
}

// ─── UI Component Props ───────────────────────────────────────────────────────

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}
