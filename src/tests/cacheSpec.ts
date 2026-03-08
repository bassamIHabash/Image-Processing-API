import fs from 'fs';
import * as imageProcessor from '../utilities/imageProcessor';
import { getCachedThumbnailImage, isThumbnailCached } from '../utilities/cache';

describe('Cache Utilities', () => {
     const filename = 'testImage';
     const width = 200;
     const height = 150;
     const fakeThumbnailPath = `/some/path/thumbnails/${filename}_${width}x${height}.jpg`;

     beforeEach(() => {
          spyOn(imageProcessor, 'getThumbnailPath').and.returnValue(
               fakeThumbnailPath,
          );
     });

     describe('getCachedThumbnailImage', () => {
          it('returns the thumbnail path when the file exists', () => {
               spyOn(fs, 'existsSync').and.returnValue(true);

               const result = getCachedThumbnailImage(filename, width, height);

               expect(imageProcessor.getThumbnailPath).toHaveBeenCalledWith(
                    filename,
                    width,
                    height,
               );
               expect(fs.existsSync).toHaveBeenCalledWith(fakeThumbnailPath);
               expect(result).toBe(fakeThumbnailPath);
          });

          it('returns null when the file does not exist', () => {
               spyOn(fs, 'existsSync').and.returnValue(false);

               const result = getCachedThumbnailImage(filename, width, height);

               expect(imageProcessor.getThumbnailPath).toHaveBeenCalledWith(
                    filename,
                    width,
                    height,
               );
               expect(fs.existsSync).toHaveBeenCalledWith(fakeThumbnailPath);
               expect(result).toBeNull();
          });

          it('forwards all arguments to getThumbnailPath', () => {
               spyOn(fs, 'existsSync').and.returnValue(false);

               getCachedThumbnailImage('anotherImage', 800, 600);

               expect(imageProcessor.getThumbnailPath).toHaveBeenCalledWith(
                    'anotherImage',
                    800,
                    600,
               );
          });
     });

     describe('isThumbnailCached', () => {
          it('returns true when the thumbnail file exists', () => {
               spyOn(fs, 'existsSync').and.returnValue(true);
               expect(isThumbnailCached(filename, width, height)).toBeTrue();
          });

          it('returns false when the thumbnail file does not exist', () => {
               spyOn(fs, 'existsSync').and.returnValue(false);
               expect(isThumbnailCached(filename, width, height)).toBeFalse();
          });

          it('reflects the underlying file existence correctly', () => {
               spyOn(fs, 'existsSync').and.returnValue(true);
               expect(isThumbnailCached(filename, width, height)).toBeTrue();

               (fs.existsSync as jasmine.Spy).and.returnValue(false);
               expect(isThumbnailCached(filename, width, height)).toBeFalse();
          });
     });
});
