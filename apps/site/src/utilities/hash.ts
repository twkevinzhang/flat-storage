import { xxhash64, crc32 } from 'hash-wasm';

export interface HashResult {
  xxHash64: string;
  crc32c: string;
}

const CHUNK_SIZE = 10 * 1024 * 1024;

export async function calculateHashes(
  file: File,
  onProgress?: (progress: number) => void
): Promise<HashResult> {
  const xxHasher = await xxhash64();
  const crcHasher = await crc32();

  const totalBytes = file.size;
  let processedBytes = 0;

  const stream = file.stream();
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      xxHasher.update(value);
      crcHasher.update(value);

      processedBytes += value.byteLength;
      if (onProgress) {
        onProgress((processedBytes / totalBytes) * 100);
      }
    }

    return {
      xxHash64: xxHasher.digest('hex'),
      crc32c: crcHasher.digest('hex'),
    };
  } finally {
    reader.releaseLock();
  }
}

export async function calculateCRC32C(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const hasher = await crc32();

  const totalBytes = file.size;
  let processedBytes = 0;

  const stream = file.stream();
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      hasher.update(value);

      processedBytes += value.byteLength;
      if (onProgress) {
        onProgress((processedBytes / totalBytes) * 100);
      }
    }

    return hasher.digest('hex');
  } finally {
    reader.releaseLock();
  }
}
