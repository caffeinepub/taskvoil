/**
 * Upload validation: 10 MB max, images only (jpg/jpeg/png/webp)
 */
export interface UploadValidationMessages {
  errorSize: string;
  errorType: string;
}

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateUpload(
  file: File,
  messages: UploadValidationMessages,
): UploadValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: messages.errorSize };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: messages.errorType };
  }
  return { valid: true };
}

export function validateUploads(
  files: File[],
  messages: UploadValidationMessages,
): UploadValidationResult {
  for (const file of files) {
    const result = validateUpload(file, messages);
    if (!result.valid) return result;
  }
  return { valid: true };
}
