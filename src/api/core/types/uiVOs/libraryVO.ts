export type GetLibraryVO = {
    libraryType: string
}

export type GetLibraryByTypeVO = {
    type: string;
    libraryType: string
}

export type GetLibraryByIdVO = {
    id: number
}

export type CreateLibraryVO = {
    name: string;
    type: string;
    tags: string;
    duration: number;
    mediaType: string;
    mediaUrl: string;
    imageUrl: string;
    description: string;
    subscriberLibrary: boolean;
    viliyoLibrary: boolean;
    title: string;
}

export type ShareLibraryVO = {
    id: number;
    libraryType: string;
}

export type DeleteLibraryVO = {
    id: number
}

export type LibraryDocumentVO = {
    mediaType: string;
    mediaUrl: string;
    description: string;
    subscriberLibrary: boolean;
    viliyoLibrary: boolean;
}

export type IndependentSessionVO = {
    id: number;
    title: string;
    description: string;
    duration: number;
    startTime: string;
    endTime: string;
    type: string;
    mediaAttachment: [];
    mediaAttachmentIds: [];
    library: number;
    libraryPlanStatus: string;
    activityType: string;
    subscriberLibrary: boolean;
    viliyoLibrary: boolean;
    tags: string;
}

export type IndependentLibrayActivityVO = {
    name: string;
    subscriberLibrary: boolean;
    viliyoLibrary: boolean;
    tags: string;
    mediaUrl:string;
    mediaType: string;
    activityType: string;
    activityData: string;

}
