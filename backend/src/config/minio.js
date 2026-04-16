const { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
const { MINIO_ENDPOINT, MINIO_PORT, MINIO_USE_SSL, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET } = require('./env');
const logger = require('../utils/logger');

const protocol = MINIO_USE_SSL ? 'https' : 'http';
const endpoint = `${protocol}://${MINIO_ENDPOINT}:${MINIO_PORT}`;

const s3Client = new S3Client({
  endpoint,
  region: 'us-east-1',
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

const bucketNotFound = (err) => {
  const status = err.$metadata?.httpStatusCode;
  // MinIO can return 404 or 403 for a non-existent bucket
  return (
    status === 404 ||
    status === 403 ||
    err.name === 'NotFound' ||
    err.name === 'NoSuchBucket' ||
    err.Code === 'NoSuchBucket'
  );
};

const initBucket = async () => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }));
    logger.info(`MinIO bucket "${MINIO_BUCKET}" already exists`);
  } catch (err) {
    if (bucketNotFound(err)) {
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }));
        logger.info(`MinIO bucket "${MINIO_BUCKET}" created`);

        const policy = JSON.stringify({
          Version: '2012-10-17',
          Statement: [{
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
          }],
        });
        await s3Client.send(new PutBucketPolicyCommand({ Bucket: MINIO_BUCKET, Policy: policy }));
        logger.info(`MinIO bucket "${MINIO_BUCKET}" policy set to public-read`);
      } catch (createErr) {
        logger.error(`MinIO bucket create error: [${createErr.name}] ${createErr.message} (HTTP ${createErr.$metadata?.httpStatusCode})`);
      }
    } else {
      const isConnectionError =
        err.name === 'AggregateError' ||
        err.code === 'ECONNREFUSED' ||
        err.errors?.some?.((e) => e.code === 'ECONNREFUSED');

      if (isConnectionError) {
        logger.warn(`MinIO no disponible en ${endpoint} — iniciá MinIO para habilitar la subida de archivos`);
      } else {
        logger.error(
          `MinIO bucket init error: [${err.name}] ${err.message || '(sin mensaje)'} (HTTP ${err.$metadata?.httpStatusCode ?? 'N/A'})`
        );
      }
    }
  }
};

module.exports = { s3Client, initBucket };
