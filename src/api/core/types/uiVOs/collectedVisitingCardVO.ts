export type CollectedVisitingCardVO = {
    id: string;
    sessionName?: string;
    sessionDate?: string;
    cardId?: number[];
    sessionId: number;
}

export interface DeleteCollectedVisitingCardVO {
    id: string
    ids: number[];
}