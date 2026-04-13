const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const { s3Client } = require('../config/minio');
const { MINIO_BUCKET, MINIO_ENDPOINT, MINIO_PORT, MINIO_USE_SSL } = require('../config/env');
const { compressPdf } = require('../utils/pdfCompressor');

const uploadPdf = async (buffer, originalName, folder = 'planos') => {
  const compressed = await compressPdf(buffer);
  const key = `${folder}/${uuidv4()}.pdf`;

  await s3Client.send(new PutObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: key,
    Body: compressed,
    ContentType: 'application/pdf',
    Metadata: { originalName: encodeURIComponent(originalName) },
  }));

  const protocol = MINIO_USE_SSL ? 'https' : 'http';
  const url = `${protocol}://${MINIO_ENDPOINT}:${MINIO_PORT}/${MINIO_BUCKET}/${key}`;

  return { key, url };
};

const deletePdf = async (key) => {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: MINIO_BUCKET, Key: key }));
  } catch (err) {
    // Non-blocking — log but don't throw
  }
};

const getSignedDownloadUrl = (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({ Bucket: MINIO_BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
};

module.exports = { uploadPdf, deletePdf, getSignedDownloadUrl };
