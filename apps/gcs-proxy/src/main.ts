import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { GcsExecutor } from './services/storage-executor';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '100mb' }));

app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

/**
 * Generic GCS Command Execution Endpoint
 */
app.post('/gcs/v1/execute', async (req, res) => {
  console.log('POST /gcs/v1/execute', {
    method: req.body.method,
    bucket: req.body.bucket,
    file: req.body.file,
  });

  try {
    const result = await GcsExecutor.execute(req.body);
    res.json({ status: 200, data: result });
  } catch (err: any) {
    console.error('Execution error:', err);
    res.status(500).json({ status: 500, message: err.message });
  }
});

/**
 * File Download Endpoint (streaming)
 */
app.get('/gcs/v1/download', async (req, res) => {
  const { bucket, file, projectId, accessKey, secretKey } = req.query as {
    bucket: string;
    file: string;
    projectId?: string;
    accessKey?: string;
    secretKey?: string;
  };

  console.log('GET /gcs/v1/download', {
    bucket,
    file,
    projectId: projectId ? `${projectId.substring(0, 10)}...` : undefined,
    hasAccessKey: !!accessKey,
    hasSecretKey: !!secretKey
  });

  try {
    const result = await GcsExecutor.execute({
      auth: {
        projectId,
        accessKey,
        secretKey,
      },
      bucket,
      file,
      method: 'download',
      args: [],
    });

    console.log('Download result type:', typeof result, 'isArray:', Array.isArray(result));

    // result[0] is the file content buffer
    const fileContent = result[0];

    console.log('File content type:', typeof fileContent, 'length:', fileContent?.length);

    // 設定檔案名稱
    const fileName = file.split('/').pop() || 'download';

    // 設定回應標頭
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // 發送檔案內容
    res.send(fileContent);

    console.log('Download completed successfully:', fileName);
  } catch (err: any) {
    console.error('Download error:', {
      message: err.message,
      stack: err.stack,
      bucket,
      file
    });
    res.status(500).json({ status: 500, message: err.message, details: err.stack });
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
