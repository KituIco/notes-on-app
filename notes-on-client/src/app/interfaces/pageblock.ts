export interface PageBlock {
    pageId: string;
    workspaceId: string;
    title: string;
    totalBlocks: number;
    locked: boolean;
    banner: boolean;
    shared: boolean;
    cover: string;
    icon: string;

    blockId: string;
    type: string;
    content: string;
    size: string;
    order: number;
}
