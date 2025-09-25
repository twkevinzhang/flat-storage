import express from 'express';
import bodyParser from 'body-parser';
import { GCSService } from '@api-server/services/gcs';
import { CSVRepository, RECORDS_PATH } from '@api-server/repositories/csv';
import { UseCaseImpl } from '@api-server/usecases/implement';
import { StorageService } from '@api-server/services/interface';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(bodyParser.json());

app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

app.get(
  '/storage/:storage/bucket/:bucket/records',
  async ({ params, query }, res) => {
    const { storage, bucket } = params;
    const service = serviceFactory(storage, bucket);
    const repo = new CSVRepository(service);
    const usecase = new UseCaseImpl(repo, service);

    const parent = query.parent ? String(query.parent) : undefined;
    const objects = await usecase.listObjects(parent);

    res.send({ status: 200, data: objects });
  }
);

app.post(
  '/storage/:storage/bucket/:bucket/records',
  async ({ params }, res) => {
    const { storage, bucket } = params;
    // bucket = bucket ?? 'storage-403503-test';
    const service = serviceFactory(storage, bucket);
    const repo = new CSVRepository(service);
    const usecase = new UseCaseImpl(repo, service);

    await usecase.generateRecordsWithPathId();

    console.log(`bucket ${bucket} records ${RECORDS_PATH} generated`);
    res.send({ status: 200, message: 'Success' });
  }
);

app.put(
  '/storage/:storage/bucket/:bucket/records/:id/path',
  async ({ body, params }, res) => {
    const { storage, bucket, id } = params;
    const { newPath } = body;
    if (!newPath) {
      res.status(400).send({ status: 400, message: 'newPath is required' });
      return;
    }

    const service = serviceFactory(storage, bucket);
    const repo = new CSVRepository(service);
    const usecase = new UseCaseImpl(repo, service);

    await usecase.moveObject(id, newPath);

    console.log(`object ${id} moved to ${newPath}`);
    res.send({ status: 200, message: 'Success' });
  }
);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

function serviceFactory(storage: string, bucket: string): StorageService {
  switch (storage) {
    case 'gcs':
      return new GCSService(bucket);
    default:
      throw new Error('Unsupported storage service');
  }
}
