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
  // 전체 조회
  getAll: () => axios.get<Asset[]>("/assets"),

  // 카테고리별 조회
  getByCategory: (category: string) =>
    axios.get<Asset[]>(`/assets?category=${category}`),

  // 키로 조회
  getByKey: (key: string) => axios.get<Asset>(`/assets/key/${key}`),

  // ID로 조회
  getOne: (id: number) => axios.get<Asset>(`/assets/${id}`),

  // 생성
  create: (data: CreateAssetDto) => axios.post<Asset>("/assets", data),

  // 수정
  update: (id: number, data: UpdateAssetDto) =>
    axios.patch<Asset>(`/assets/${id}`, data),

  // 키로 수정
  updateByKey: (key: string, data: UpdateAssetDto) =>
    axios.patch<Asset>(`/assets/key/${key}`, data),

  // 삭제
  delete: (id: number) => axios.delete(`/assets/${id}`),

  // 파일 업로드 (새 자산 또는 기존 자산 업데이트)
  uploadFile: (
    file: File,
    assetKey: string,
    category: string,
    title?: string,
    description?: string
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
