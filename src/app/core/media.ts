import { Injectable } from '@angular/core';
export function validateImage(file: Pick<File, 'type' | 'size'>) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)
    throw Error('Choose a JPG, PNG or WebP image up to 5 MB.');
}
@Injectable({ providedIn: 'root' })
export class MediaStore {
  private db(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) return reject(Error('Image storage is unavailable.'));
      const r = indexedDB.open('skill2work-media', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('images');
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async save(file: File): Promise<string> {
    validateImage(file);
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((ok, no) => {
        const image = new Image();
        image.onload = () => ok(image);
        image.onerror = () => no(Error('This image could not be read.'));
        image.src = url;
      });
      const ratio = Math.min(1, 1400 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * ratio));
      canvas.height = Math.max(1, Math.round(img.height * ratio));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw Error('Image editing is unavailable in this browser.');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((ok, no) =>
        canvas.toBlob(
          (b) => (b ? ok(b) : no(Error('Image conversion failed.'))),
          'image/webp',
          0.78,
        ),
      );
      if (blob.size > 400000) throw Error('Image is too detailed. Choose a smaller image.');
      try {
        const db = await this.db();
        const id = 'media:' + crypto.randomUUID();
        await new Promise<void>((ok, no) => {
          const tx = db.transaction('images', 'readwrite');
          tx.objectStore('images').put(blob, id);
          tx.oncomplete = () => ok();
          tx.onerror = () => no(tx.error);
          tx.onabort = () => no(tx.error);
        });
        db.close();
        return id;
      } catch {
        if (blob.size > 60000)
          throw Error(
            'Browser image storage is unavailable. Use a simpler image under 60 KB after resizing.',
          );
        const fallback = canvas.toDataURL('image/webp', 0.6);
        if (!fallback.startsWith('data:image/webp;base64,') || fallback.length > 90000)
          throw Error('Image storage is unavailable. Choose a smaller image.');
        return fallback;
      }
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  async source(ref: string): Promise<string> {
    if (ref.startsWith('data:image/webp;base64,') && ref.length < 120000) return ref;
    if (!ref.startsWith('media:')) return ref.startsWith('assets/') ? ref : '';
    try {
      const db = await this.db();
      const blob = await new Promise<Blob>((ok, no) => {
        const r = db.transaction('images').objectStore('images').get(ref);
        r.onsuccess = () => ok(r.result);
        r.onerror = () => no(r.error);
      });
      db.close();
      return blob ? URL.createObjectURL(blob) : '';
    } catch {
      return '';
    }
  }
}
