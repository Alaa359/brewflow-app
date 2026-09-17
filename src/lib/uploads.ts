import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { MessageTranslator } from '@/lib/i18n/translator';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export async function saveImage(
  folder: string,
  file: File | null,
  t: MessageTranslator
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(t('tooLarge'));
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(t('unsupportedType'));
  }

  const extension =
    file.type === 'image/jpeg'
      ? 'jpg'
      : file.type === 'image/webp'
        ? 'webp'
        : 'png';
  const filename = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(PUBLIC_DIR, 'uploads', folder);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(
    path.join(uploadDir, filename),
    Buffer.from(await file.arrayBuffer())
  );

  return `/uploads/${folder}/${filename}`;
}

export async function removeImage(imageUrl: string | null) {
  if (!imageUrl) return;
  const filePath = path.join(PUBLIC_DIR, imageUrl);
  if (!filePath.startsWith(PUBLIC_DIR)) return;
  await unlink(filePath).catch(() => {});
}
