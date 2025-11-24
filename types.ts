export interface Lead {
  id: string;
  name: string;
  username: string;
  phone: string | null;
  originalPhone: string;
  notes?: string;
  status: 'pending' | 'contacted' | 'skipped';
}

export interface ImportStats {
  total: number;
  validPhones: number;
  missingPhones: number;
}

export interface MessageTemplate {
  text: string;
}

export interface ColumnMapping {
  name: string[];
  username: string[];
  phone: string[];
}