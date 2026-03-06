import fs from 'fs';
import { getThumbnailPath } from './imageProcessor';

/**
 * Checks if a resized thumbnail already exists in the cache.
 * Returns the cached file path if it exists, or null if it doesn't.
 */
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

// Check if the thumbnail image exists
export const isThumbnailCached = (filename: string, width: number, height: number): boolean => {
    return getCachedThumbnailImage(filename, width, height) !== null;
};