declare namespace MODELS {
    export interface IUser {

    }

    export interface VocabularyForUpdate {
        id: number;
        wordJp: string;
        reading: string;
        imageUrl?: string | null;
        audioUrl?: string | null;
    }
}