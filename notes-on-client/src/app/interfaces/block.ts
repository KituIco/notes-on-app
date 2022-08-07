export interface Block {
    blockId: string;
    pageId: string;
    type: string;
    content: string;
    size: string;
    order: number;
}

export interface Sizes {
    [key: string]: number;
}
