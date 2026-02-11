import { openDB, DBSchema } from 'idb';

export interface PhotoEntry {
  id: string;
  jobId: string;
  category: 'before' | 'during' | 'after';
  dataUrl: string;
  caption: string;
  timestamp: string;
}

interface PhotoDB extends DBSchema {
  photos: {
    key: string;
    value: PhotoEntry;
    indexes: { 'by-job': string };
  };
}

const DB_NAME = 'tilepro-photos';
const DB_VERSION = 1;

function getDb() {
  return openDB<PhotoDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('photos', { keyPath: 'id' });
      store.createIndex('by-job', 'jobId');
    },
  });
}

export async function addPhoto(photo: PhotoEntry): Promise<void> {
  const db = await getDb();
  await db.put('photos', photo);
}

export async function getPhotosByJob(jobId: string): Promise<PhotoEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex('photos', 'by-job', jobId);
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('photos', id);
}

export async function updatePhotoCaption(id: string, caption: string): Promise<void> {
  const db = await getDb();
  const photo = await db.get('photos', id);
  if (photo) {
    photo.caption = caption;
    await db.put('photos', photo);
  }
}

export async function getAllPhotos(): Promise<PhotoEntry[]> {
  const db = await getDb();
  return db.getAll('photos');
}

export async function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
