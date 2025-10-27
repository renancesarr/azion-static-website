import { UploadIndexEntry } from '../uploadIndexEntry.js';
import type { UploadIndexFileData } from '../shared/uploadIndexFileData.js';

function cloneFiles(files: Record<string, UploadIndexEntry>): Record<string, UploadIndexEntry> {
  const cloned: Record<string, UploadIndexEntry> = {};
  for (const [key, value] of Object.entries(files ?? {})) {
    cloned[key] = { ...value };
  }
  return cloned;
}

export class UploadIndexFile implements UploadIndexFileData {
  readonly bucketId: string;
  readonly bucketName: string;
  readonly files: Record<string, UploadIndexEntry>;
  readonly updatedAt: string;

  private constructor(data: UploadIndexFileData) {
    this.bucketId = data.bucketId;
    this.bucketName = data.bucketName;
    this.files = cloneFiles(data.files);
    this.updatedAt = data.updatedAt;
    Object.freeze(this.files);
  }

  static create(data: UploadIndexFileData): UploadIndexFile {
    return new UploadIndexFile({
      ...data,
      files: cloneFiles(data.files ?? {}),
    });
  }

  static hydrate(data: UploadIndexFileData): UploadIndexFile {
    return UploadIndexFile.create(data);
  }

  withFiles(files: Record<string, UploadIndexEntry>): UploadIndexFile {
    return UploadIndexFile.create({
      bucketId: this.bucketId,
      bucketName: this.bucketName,
      updatedAt: this.updatedAt,
      files,
    });
  }

  withUpdatedAt(updatedAt: string): UploadIndexFile {
    return UploadIndexFile.create({
      ...this.toJSON(),
      updatedAt,
    });
  }

  toJSON(): UploadIndexFileData {
    return {
      bucketId: this.bucketId,
      bucketName: this.bucketName,
      files: cloneFiles(this.files),
      updatedAt: this.updatedAt,
    };
  }
}
