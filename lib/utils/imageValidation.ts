const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp']

export interface ValidationResult {
    valid: boolean
    error?: string
}

export function validateImage(file: File): ValidationResult {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size exceeds 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
        }
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: JPG, PNG, HEIC, WEBP.`,
        }
    }

    return { valid: true }
}

export function getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

export function generateUniqueFileName(userId: string, originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9) // Add random string
    const extension = getFileExtension(originalName)
    return `${userId}/${timestamp}-${random}.${extension}`
}
