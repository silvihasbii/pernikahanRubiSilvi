export interface BankAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
}

export interface WeddingConfig {
  id: string;
  groom_name: string;
  groom_full_name: string;
  groom_parents: string;
  groom_instagram?: string;
  bride_name: string;
  bride_full_name: string;
  bride_parents: string;
  bride_instagram?: string;
  wedding_date: string;
  akad_time: string;
  akad_location: string;
  akad_address: string;
  akad_map_url?: string;
  resepsi_time: string;
  resepsi_location: string;
  resepsi_address: string;
  resepsi_map_url?: string;
  quote: string;
  quote_source: string;
  audio_url?: string;
  bank_accounts: BankAccount[];
  updated_at?: string;
}

export interface RsvpItem {
  id: string;
  name: string;
  guests_count: number;
  attendance: 'attending' | 'not_attending' | 'tentative';
  message?: string;
  created_at: string;
}

export interface RsvpStats {
  totalResponses: number;
  totalAttending: number;
  totalNotAttending: number;
}

export interface WishItem {
  id: string;
  name: string;
  relation: string;
  message: string;
  attendance?: string;
  likes: number;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  category: string;
  display_order: number;
  created_at: string;
}

export interface AdminStats {
  totalRsvps: number;
  totalGuestsAttending: number;
  totalNotAttending: number;
  totalTentative: number;
  totalWishes: number;
  totalPhotos: number;
  activeStreams: number;
}

export interface AdminUser {
  id: string;
  username: string;
}
