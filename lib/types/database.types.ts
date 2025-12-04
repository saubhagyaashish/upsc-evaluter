export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            user_profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    email: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    email?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    email?: string | null
                    created_at?: string
                }
            }
            questions: {
                Row: {
                    id: string
                    question_text: string
                    category: string
                    subject: string | null
                    year: number | null
                    word_limit: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    question_text: string
                    category: string
                    subject?: string | null
                    year?: number | null
                    word_limit?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    question_text?: string
                    category?: string
                    subject?: string | null
                    year?: number | null
                    word_limit?: number
                    created_at?: string
                }
            }
            answers: {
                Row: {
                    id: string
                    user_id: string
                    question_id: string | null
                    question_text: string
                    question_source: 'manual' | 'bank' | 'ocr'
                    image_url: string
                    extracted_text: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    question_id?: string | null
                    question_text: string
                    question_source: 'manual' | 'bank' | 'ocr'
                    image_url: string
                    extracted_text?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    question_id?: string | null
                    question_text?: string
                    question_source?: 'manual' | 'bank' | 'ocr'
                    image_url?: string
                    extracted_text?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            evaluations: {
                Row: {
                    id: string
                    answer_id: string
                    score: number
                    structure_feedback: string | null
                    points_missed: string[] | null
                    suggestions: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    answer_id: string
                    score: number
                    structure_feedback?: string | null
                    points_missed?: string[] | null
                    suggestions?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    answer_id?: string
                    score?: number
                    structure_feedback?: string | null
                    points_missed?: string[] | null
                    suggestions?: string | null
                    created_at?: string
                }
            }
        }
    }
}
