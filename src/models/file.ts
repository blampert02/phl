import { nanoid } from 'nanoid';

export const MATCH_SPECIAL_CHARACTERS_REGEX = /[^a-zA-Z ]/g;

export type Directory = {
  id: string;
  name: string;
  content: (LocalFile | Directory)[];
  parentDirectoryId: string;
  path?: string;
  internalName: string;
}

export type LocalFile = {
  id: string;
  name: string;
  downloadUrl: string;
  parentDirectoryId: string;
  path?: string;
  internalName: string;
};


export function createDirectory(name: string, parentDirectoryId: string): Directory {
  return {
    id: nanoid(16),
    name,
    parentDirectoryId,
    content: [],
    internalName: name.replace(MATCH_SPECIAL_CHARACTERS_REGEX, '')
  }
}

export function createFile(name: string, downloadUrl: string, parentDirectoryId: string): LocalFile {
  return {
    id: nanoid(16),
    name,
    downloadUrl,
    parentDirectoryId,
    internalName: name.replace(MATCH_SPECIAL_CHARACTERS_REGEX, '')
  }
}
