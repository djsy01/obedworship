import axios from "./axios";
import type { Asset, CreateAssetDto, UpdateAssetDto } from "./assets-types";
export type * from "./assets-types";

export const assetApi = {
  getAll: () => axios.get<Asset[]>("/assets"),

  getByCategory: (category: string) =>
    axios.get<Asset[]>(`/assets?category=${category}`),

  getByKey: (key: string) => axios.get<Asset>(`/assets/key/${key}`),

  getOne: (id: number) => axios.get<Asset>(`/assets/${id}`),

  create: (data: CreateAssetDto) => axios.post<Asset>("/assets", data),

  update: (id: number, data: UpdateAssetDto) =>
    axios.patch<Asset>(`/assets/${id}`, data),

  updateByKey: (key: string, data: UpdateAssetDto) =>
    axios.patch<Asset>(`/assets/key/${key}`, data),

  delete: (id: number) => axios.delete(`/assets/${id}`),

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
      timeout: 300000, // 대용량 음원/영상 업로드 대비 5분
    });
  },
};
