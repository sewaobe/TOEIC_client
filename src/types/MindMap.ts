export interface MindMapNode {
  name: string;
  details?: string;
  children?: MindMapNode[];
}

export interface MindMapStorage {
  [noteId: string]: {
    mindMap: MindMapNode;
    generatedAt: string;
  };
}
