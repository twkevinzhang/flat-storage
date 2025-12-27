import { ObjectEntity } from '@site/models';
import axios from 'axios';

export interface ExpandedFile {
  entity: ObjectEntity;
  relativePath: string;
}

/**
 * Recursively expand a folder to get all file entities
 */
export function expandFolder(
  folder: ObjectEntity,
  allEntities: ObjectEntity[],
  basePath: string = ''
): ExpandedFile[] {
  const result: ExpandedFile[] = [];
  const folderPathStr = folder.path.toString();

  for (const entity of allEntities) {
    const entityPathStr = entity.path.toString();

    // Check if entity is inside this folder
    if (entityPathStr.startsWith(folderPathStr + '/')) {
      const relativePath = entityPathStr.substring(folderPathStr.length + 1);

      if (entity.isFolder) {
        // Recursively expand subfolders
        result.push(...expandFolder(entity, allEntities, basePath ? `${basePath}/${relativePath}` : relativePath));
      } else {
        // Add file with relative path
        result.push({
          entity,
          relativePath: basePath ? `${basePath}/${relativePath}` : relativePath
        });
      }
    }
  }

  return result;
}

/**
 * Expand selections to include all files in folders
 */
export function expandSelections(
  selectedEntities: ObjectEntity[],
  allEntities: ObjectEntity[]
): ExpandedFile[] {
  const result: ExpandedFile[] = [];

  for (const entity of selectedEntities) {
    if (!entity.isFolder) {
      // Direct file selection
      result.push({
        entity,
        relativePath: entity.name
      });
    } else {
      // Folder selection - expand to all files
      result.push(...expandFolder(entity, allEntities));
    }
  }

  return result;
}

/**
 * Download file from signed URL using browser download
 */
export async function downloadFile(
  signedUrl: string,
  filename: string,
  onProgress?: (downloadedBytes: number) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await axios.get(signedUrl, {
    responseType: 'blob',
    signal,
    onDownloadProgress: (progressEvent) => {
      if (onProgress && progressEvent.loaded) {
        onProgress(progressEvent.loaded);
      }
    }
  });

  const blob = response.data;
  const blobUrl = URL.createObjectURL(blob);

  try {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    // Cleanup blob URL after a delay to ensure download starts
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }
}
