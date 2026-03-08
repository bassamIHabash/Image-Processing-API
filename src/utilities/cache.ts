import fs from 'fs';
import { getThumbnailPath } from './imageProcessor';

export const getCachedThumbnailImage = (
     filename: string,
     width: number,
     height: number,
): string | null => {
     const thumbnailPath = getThumbnailPath(filename, width, height);

     if (fs.existsSync(thumbnailPath)) {
          return thumbnailPath;
     }

     return null;
};

export const isThumbnailCached = (
     filename: string,
     width: number,
     height: number,
): boolean => {
     return getCachedThumbnailImage(filename, width, height) !== null;
};
