export interface Asset {
  id: number;
  asset_key: string;
  asset_type: "image" | "audio" | "video" | "document";
  category: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  title?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
  uploaded_at?: string;
  updated_at?: string;
}

export interface CreateAssetDto {
  asset_key: string;
  asset_type: "image" | "audio" | "video" | "document";
  category: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  title?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateAssetDto {
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  title?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}
