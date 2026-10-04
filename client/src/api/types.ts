// Shared types across API modules

export interface UploadResponse {
  filename: string;
  savedFilename: string;
  size: number;
  mimetype: string;
  url: string;
}
