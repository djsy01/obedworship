import axios from "./axios";

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
