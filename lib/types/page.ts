export interface Page {
  id: string;
  userId: string;
  folderId: string | null;
  title: string;
  content: Record<string, any>;
  isPublished: boolean;
  slug: string | null;
  publishedAt: Date | null;
  folder?: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  userId: string;
  parentId: string | null;
  name: string;
  position: number;
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: Folder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PageLink {
  id: string;
  toPageId: string;
  toPage: {
    id: string;
    title: string;
    slug: string | null;
  };
  createdAt: Date;
}

export interface BacklinkType {
  id: string;
  fromPageId: string;
  fromPage: {
    id: string;
    title: string;
    slug: string | null;
  };
  createdAt: Date;
}

export interface PageLinks {
  outgoing: PageLink[];
  incoming: BacklinkType[];
}

export interface CreatePageDto {
  title: string;
  content?: Record<string, any>;
  folderId?: string | null;
}

export interface UpdatePageDto {
  title?: string;
  content?: Record<string, any>;
  folderId?: string | null;
}

export interface PublishPageDto {
  slug: string;
}

export interface CreateFolderDto {
  name: string;
  parentId?: string | null;
}

export interface UpdateFolderDto {
  name?: string;
  parentId?: string | null;
}

export interface MoveFolderDto {
  parentId: string | null;
}

export interface BinItem {
  id: string;
  userId: string;
  itemType: 'page' | 'folder';
  itemId: string;
  itemData: {
    page?: Page;
    folder?: Folder;
    pages?: Page[];
    subfolders?: Folder[];
    links?: PageLink[];
    allPageLinks?: PageLink[];
  };
  deletedAt: Date;
  createdAt: Date;
}

