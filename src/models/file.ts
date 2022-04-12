import { nanoid } from 'nanoid';

export type Directory = {
  id: string;
  name: string;
  content: (LocalFile | Directory)[];
  parentDirectoryId: string;
  path?: string;
}

export type LocalFile = {
  id: string;
  name: string;
  downloadUrl: string;
  parentDirectoryId: string;
  path?: string;
};


export function createDirectory(name: string, parentDirectoryId: string): Directory {
  return {
    id: nanoid(16),
    name,
    parentDirectoryId,
    content: []
  }
}

export function createFile(name: string, downloadUrl: string, parentDirectoryId: string): LocalFile {
  return {
    id: nanoid(16),
    name,
    downloadUrl,
    parentDirectoryId
  }
}
