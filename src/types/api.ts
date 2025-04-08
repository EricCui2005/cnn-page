export interface ClassificationResult {
  predictions: Array<{
    label: string;
    confidence: number;
  }>;
}

export interface ApiError {
  error: string;
  status: number;
}

export interface ImageUploadResponse {
  success: boolean;
  message?: string;
  data?: ClassificationResult;
  error?: string;
}
