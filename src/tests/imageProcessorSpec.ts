import fs from 'fs';
import path from 'path';
import {
     getSourceImagePath,
     getThumbnailPath,
     isFullImageExists,
     resizeImage,
} from '../utilities/imageProcessor';

describe('imageProcessor utilities', () => {
     describe('getSourceImagePath', () => {
          it('returns a path ending with "<filename>.jpg"', () => {
               const result = getSourceImagePath('encenadaport');
               expect(result.endsWith('encenadaport.jpg')).toBeTrue();
          });

          it('includes the images/full directory segment', () => {
               const normalised = getSourceImagePath('fjord')
                    .split(path.sep)
                    .join('/');
               expect(normalised).toContain('images/full/fjord.jpg');
          });

          it('produces different paths for different filenames', () => {
               expect(getSourceImagePath('a')).not.toEqual(
                    getSourceImagePath('b'),
               );
          });
     });

     describe('getThumbnailPath', () => {
          it('returns a path containing "<filename>_<width>x<height>.jpg"', () => {
               expect(
                    getThumbnailPath('testImage', 200, 150).endsWith(
                         'testImage_200x150.jpg',
                    ),
               ).toBeTrue();
          });

          it('includes the public/thumbnails directory segment', () => {
               const normalised = getThumbnailPath('fjord', 800, 600)
                    .split(path.sep)
                    .join('/');
               expect(normalised).toContain(
                    'public/thumbnails/fjord_800x600.jpg',
               );
          });

          it('produces unique paths for different dimension combinations', () => {
               const a = getThumbnailPath('img', 100, 100);
               const b = getThumbnailPath('img', 200, 100);
               const c = getThumbnailPath('img', 100, 200);
               expect(a).not.toEqual(b);
               expect(a).not.toEqual(c);
               expect(b).not.toEqual(c);
          });
     });

     describe('isFullImageExists', () => {
          beforeEach(() => {
               spyOn(fs, 'existsSync');
          });

          it('returns true when the source file exists', () => {
               (fs.existsSync as jasmine.Spy).and.returnValue(true);

               expect(isFullImageExists('encenadaport')).toBeTrue();
               expect(fs.existsSync).toHaveBeenCalledWith(
                    getSourceImagePath('encenadaport'),
               );
          });

          it('returns false when the source file is absent', () => {
               (fs.existsSync as jasmine.Spy).and.returnValue(false);
               expect(isFullImageExists('nonexistent')).toBeFalse();
          });
     });

     describe('resizeImage', () => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const imageProcessorModule = require('../utilities/imageProcessor');

          let mockToFile: jasmine.Spy;
          let mockJpeg: jasmine.Spy;
          let mockResize: jasmine.Spy;

          beforeEach(() => {
               mockToFile = jasmine
                    .createSpy('toFile')
                    .and.resolveTo(undefined);
               mockJpeg = jasmine
                    .createSpy('jpeg')
                    .and.returnValue({ toFile: mockToFile });
               mockResize = jasmine
                    .createSpy('resize')
                    .and.returnValue({ jpeg: mockJpeg });

               spyOn(
                    imageProcessorModule,
                    'createSharpInstance',
               ).and.returnValue({ resize: mockResize });
               spyOn(fs, 'existsSync');
          });

          describe('when the source image does not exist', () => {
               beforeEach(() => {
                    (fs.existsSync as jasmine.Spy).and.returnValue(false);
               });

               it('throws an error naming the missing file', async () => {
                    await expectAsync(
                         resizeImage({
                              filename: 'missing',
                              width: 200,
                              height: 150,
                         }),
                    ).toBeRejectedWithError(
                         'Source image not found: missing.jpg',
                    );
               });

               it('does not invoke the sharp pipeline', async () => {
                    await resizeImage({
                         filename: 'missing',
                         width: 100,
                         height: 100,
                    }).catch(() => {});
                    expect(
                         imageProcessorModule.createSharpInstance,
                    ).not.toHaveBeenCalled();
               });
          });

          describe('when the source image exists', () => {
               beforeEach(() => {
                    (fs.existsSync as jasmine.Spy).and.returnValue(true);
               });

               it('opens a sharp instance with the correct source path', async () => {
                    await resizeImage({
                         filename: 'fjord',
                         width: 400,
                         height: 300,
                    });
                    expect(
                         imageProcessorModule.createSharpInstance,
                    ).toHaveBeenCalledWith(getSourceImagePath('fjord'));
               });

               it('calls resize with the supplied dimensions and options', async () => {
                    await resizeImage({
                         filename: 'fjord',
                         width: 400,
                         height: 300,
                    });
                    expect(mockResize).toHaveBeenCalledWith(400, 300, {
                         fit: 'cover',
                         position: 'center',
                    });
               });

               it('calls jpeg with quality 85', async () => {
                    await resizeImage({
                         filename: 'fjord',
                         width: 400,
                         height: 300,
                    });
                    expect(mockJpeg).toHaveBeenCalledWith({ quality: 85 });
               });

               it('calls toFile with the correct thumbnail path', async () => {
                    await resizeImage({
                         filename: 'fjord',
                         width: 400,
                         height: 300,
                    });
                    expect(mockToFile).toHaveBeenCalledWith(
                         getThumbnailPath('fjord', 400, 300),
                    );
               });

               it('resolves with the thumbnail output path', async () => {
                    const result = await resizeImage({
                         filename: 'fjord',
                         width: 400,
                         height: 300,
                    });
                    expect(result).toBe(getThumbnailPath('fjord', 400, 300));
               });
          });
     });
});
