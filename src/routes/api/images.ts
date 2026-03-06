import { getCachedThumbnailImage } from '../..//utilities/cache';
import { isFullImageExists, resizeImage } from '../../utilities/imageProcessor';
import expess from 'express';

const imagesApisRouters = expess.Router();

imagesApisRouters.get('/', async (req, res) => {
    const filename: string = req.query.filename as string;
    const width: number = Number(req.query.width);
    const height: number = Number(req.query.height);

    // Check if the full image exists
    if (!isFullImageExists(filename)) {
        res.status(404).json({
            error: `Image "${filename}" not found. Make sure the file exists in images/full/ as a .jpg`,
        });
        return;
    }

    const cachedThumbnailImage = getCachedThumbnailImage(filename as string, width as number, height as number);
    // Check if the thumbnail image exists
    if (cachedThumbnailImage) {
        res.sendFile(cachedThumbnailImage);
        return;
    }

    try {
        const outputPath = await resizeImage({ filename, width, height });
        res.sendFile(outputPath);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error during image processing';
        res.status(500).json({ error: message });
    }
});

export default imagesApisRouters;