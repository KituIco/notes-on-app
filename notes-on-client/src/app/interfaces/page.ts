export interface Page {
    pageId: string;
    workspaceId: string;
    title: string;
    totalBlocks: number;
    order: number;
    locked: boolean;
    banner: boolean;
    shared: boolean;
    cover: string;
    icon: string;
}

export interface Search {
    pageId: string;
    workspaceId: string;
    title: string;
    searched: string;
    icon: string;
}