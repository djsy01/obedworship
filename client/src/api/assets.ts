/**
 * assets.ts - Static Assets API Client
 *
 * Backend API Endpoints Required:
 * - GET    /assets                 - Get all assets
 * - GET    /assets?category=X      - Filter by category (home, songs, etc.)
 * - GET    /assets/key/:key        - Get asset by unique key
 * - GET    /assets/:id             - Get asset by ID
 * - POST   /assets                 - Create asset record
 * - PATCH  /assets/:id             - Update asset by ID
 * - PATCH  /assets/key/:key        - Update asset by key
 * - DELETE /assets/:id             - Delete asset
 * - POST   /assets/upload          - Upload file (multipart/form-data)
 *
 * Database Table: assets
 *
 * Purpose: Manage static assets that need to be updateable from admin
 * - Home page team photo (key: "home_team_photo")
 * - Logo (key: "home_logo")
 * - Music files, etc.
 *
 * Upload Logic:
 * - If asset_key exists, delete old file and update record
 * - If asset_key doesn't exist, create new record
 * - Files stored in Google Cloud Storage (GCS)
 */
import axios from "./axios";

/**
 * Asset data structure
 * Maps to assets table in MySQL
 */
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

export const assetApi = {
  // View all
  getAll: () => axios.get<Asset[]>("/assets"),

  // Search by category
  getByCategory: (category: string) =>
    axios.get<Asset[]>(`/assets?category=${category}`),

  // Search by key
  getByKey: (key: string) => axios.get<Asset>(`/assets/key/${key}`),

  // Search by ID
  getOne: (id: number) => axios.get<Asset>(`/assets/${id}`),

  // create
  create: (data: CreateAssetDto) => axios.post<Asset>("/assets", data),

  // correction
  update: (id: number, data: UpdateAssetDto) =>
    axios.patch<Asset>(`/assets/${id}`, data),

  // edit with key
  updateByKey: (key: string, data: UpdateAssetDto) =>
    axios.patch<Asset>(`/assets/key/${key}`, data),

  // delete
  delete: (id: number) => axios.delete(`/assets/${id}`),

  // Upload file (new asset or update existing asset)
  uploadFile: (
    file: File,
    assetKey: string,
    category: string,
    title?: string,
    description?: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("asset_key", assetKey);
    formData.append("category", category);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);

    return axios.post<Asset>("/assets/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
