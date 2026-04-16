const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const { s3Client, initBucket } = require('../config/minio');
const { MINIO_BUCKET, MINIO_ENDPOINT, MINIO_PORT, MINIO_USE_SSL } = require('../config/env');
const { compressPdf } = require('../utils/pdfCompressor');
const logger = require('../utils/logger');

const isConnectionError = (err) =>
  err.name === 'AggregateError' ||
  err.code === 'ECONNREFUSED' ||
  err.errors?.some?.((e) => e.code === 'ECONNREFUSED');

const isBucketMissing = (err) =>
  err.name === 'NoSuchBucket' ||
  err.Code === 'NoSuchBucket' ||
  err.code === 'NoSuchBucket' ||
  err.$metadata?.httpStatusCode === 404 ||
  err.message?.toLowerCase().includes('does not exist');

const buildCommand = (key, body) => new PutObjectCommand({
  Bucket: MINIO_BUCKET,
  Key: key,
  Body: body,
  ContentType: 'application/pdf',
  ContentLength: body.length,
  Metadata: {},
});

const uploadPdf = async (buffer, originalName, folder = 'planos') => {
  const compressed = await compressPdf(buffer);
  const key = `${folder}/${uuidv4()}.pdf`;

  try {
    await s3Client.send(buildCommand(key, compressed));
  } catch (err) {
    if (isConnectionError(err)) {
      throw Object.assign(
        new Error('Servicio de almacenamiento no disponible. Verificá que MinIO esté corriendo.'),
        { status: 503 }
      );
    }

    // El bucket no existe (servidor arrancó antes de que MinIO estuviera listo)
    // Intentar crearlo y reintentar el upload una sola vez
    if (isBucketMissing(err)) {
      logger.warn('Bucket no encontrado — intentando crearlo y reintentando upload...');
      await initBucket();
      await s3Client.send(buildCommand(key, compressed));
      logger.info('Bucket creado y upload reintentado con éxito');
    } else {
      throw err;
    }
  }

  const protocol = MINIO_USE_SSL ? 'https' : 'http';
  const url = `${protocol}://${MINIO_ENDPOINT}:${MINIO_PORT}/${MINIO_BUCKET}/${key}`;

  return { key, url };
};

const deletePdf = async (key) => {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: MINIO_BUCKET, Key: key }));
  } catch {
    // Non-blocking
  }
};

const getSignedDownloadUrl = (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({ Bucket: MINIO_BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
};

module.exports = { uploadPdf, deletePdf, getSignedDownloadUrl };
