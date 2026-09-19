import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const bucket = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'us-east-1';

export function isStorageConfigured(): boolean {
  return Boolean(endpoint && bucket && accessKeyId && secretAccessKey);
}

let cached: S3Client | null = null;

function client(): S3Client {
  if (!cached) {
    cached = new S3Client({
      region,
      endpoint,
      // Neon object storage requires path-style addressing.
      forcePathStyle: true,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
    });
  }
  return cached;
}

/** Public URL for an object. Override the base with AWS_S3_PUBLIC_URL if needed. */
export function getPublicUrl(key: string): string {
  const base = (process.env.AWS_S3_PUBLIC_URL || `${endpoint}/${bucket}`).replace(/\/+$/, '');
  return `${base}/${key}`;
}

export async function uploadObject(key: string, body: Uint8Array, contentType: string): Promise<string> {
  await client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  return getPublicUrl(key);
}

export async function deleteObject(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/** Presigned GET URL — for objects in a private bucket. */
export async function getPresignedGetUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
}
