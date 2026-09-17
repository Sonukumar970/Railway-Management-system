import fs from 'node:fs/promises';
import path from 'node:path';

export const ensureDir = async (targetPath: string): Promise<void> => {
  await fs.mkdir(targetPath, { recursive: true });
};

export const readJson = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    await ensureDir(path.dirname(filePath));
    await writeJson(filePath, fallback);
    return fallback;
  }
};

export const writeJson = async <T>(filePath: string, data: T): Promise<void> => {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};
