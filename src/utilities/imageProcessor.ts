import path from "path";
import fs from "fs";
import sharp, { Sharp } from 'sharp';

const FULL_IMAGES_DIR = path.join(__dirname, '../../images/full');
const THUMBNAIL_IMAGES_DIR = path.join(__dirname, '../../public/thumbnails');

export const getSourceImagePath = (filename: string): string => {
    return path.join(FULL_IMAGES_DIR, `${filename}.jpg`);
};

export const getThumbnailPath = (filename: string, width: number, height: number): string => {
    return path.join(THUMBNAIL_IMAGES_DIR, `${filename}_${width}x${height}.jpg`);
};

// To check if image is exists
export const isFullImageExists = (filename: string): boolean => {
    const sourcePath = getSourceImagePath(filename);
    return fs.existsSync(sourcePath);
};

export const resizeImage = async ({
    filename,
    width,
    height,
}: {
    filename: string;
    width: number;
    height: number;
}): Promise<string> => {

    //   ensureThumbnailsDir();

    const sourcePath = getSourceImagePath(filename);
    const outputPath = getThumbnailPath(filename, width, height);

    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source image not found: ${filename}.jpg`);
    }

    const image: Sharp = sharp(sourcePath);

    await image
        .resize(width, height, {
            fit: 'cover',
            position: 'center',
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

    return outputPath;
};