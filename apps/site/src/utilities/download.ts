import axios from 'axios';

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
      console.log('progressEvent', progressEvent);
      if (onProgress && progressEvent.loaded) {
        onProgress(progressEvent.loaded);
      }
    },
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
