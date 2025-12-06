// OCR Provider Interface - similar to AI Provider
export interface OCRProvider {
    extractQuestionFromImage(imageUrl: string): Promise<string>
    extractTextFromImage(imageUrl: string): Promise<string>
}
