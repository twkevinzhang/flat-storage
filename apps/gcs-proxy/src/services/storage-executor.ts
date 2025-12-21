import { Storage, File, Bucket } from '@google-cloud/storage';

export interface GcsRequest {
  auth: {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
    accessKey?: string;
    secretKey?: string;
  };
  bucket?: string;
  file?: string;
  method: string;
  args: any[];
}

export class GcsExecutor {
  static async execute(req: GcsRequest) {
    const storage = new Storage({
      projectId: req.auth.projectId,
      credentials: req.auth.clientEmail && req.auth.privateKey ? {
        client_email: req.auth.clientEmail,
        private_key: req.auth.privateKey.replace(/\\n/g, '\n'),
      } : undefined,
      ...(req.auth.accessKey && req.auth.secretKey ? {
        // Use HMAC via S3 compatibility layer if needed, 
        // but for now we prioritize service account auth.
        // Google SDK doesn't natively use HMAC keys for its primary methods.
      } : {})
    });

    let target: any = storage;
    if (req.bucket) {
      target = target.bucket(req.bucket);
      if (req.file) {
        target = target.file(req.file);
      }
    }

    if (typeof target[req.method] !== 'function') {
      throw new Error(`Method ${req.method} not found on target`);
    }

    const result = await target[req.method](...req.args);
    return this.sanitize(result);
  }

  private static sanitize(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }
    
    if (obj instanceof File) {
      return {
        name: obj.name,
        bucket: obj.bucket.name,
        metadata: obj.metadata,
      };
    }

    if (obj instanceof Bucket) {
      return {
        name: obj.name,
        metadata: obj.metadata,
      };
    }

    if (obj !== null && typeof obj === 'object') {
      if (Buffer.isBuffer(obj)) {
        return obj;
      }
      // If it's a simple object, return it but be careful with circularity
      // For now, let's just return it and see what happens.
      // But we should strip out things that are clearly SDK internal classes.
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const val = obj[key];
          if (typeof val === 'function') continue;
          if (key === 'storage' || key === 'bucket' || key === 'file') continue; // Strip circular SDK refs
          sanitized[key] = val;
        }
      }
      return sanitized;
    }

    return obj;
  }
}

