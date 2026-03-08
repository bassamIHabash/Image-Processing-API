import supertest from 'supertest';
import express, { Application } from 'express';
import imagesApisRouters from '../../../routes/api/images';
import * as cache from '../../../utilities/cache';
import * as imageProcessor from '../../../utilities/imageProcessor';

const app: Application = express();
app.use(express.json());
app.use('/api/images', imagesApisRouters);

const request = supertest(app);
const BASE_URL = '/api/images';
const QUERY = `?filename=testImage&width=200&height=150`;
const FAKE_THUMBNAIL_PATH = '/fake/path/testImage_200x150.jpg';

describe('GET /api/images', () => {
     beforeEach(() => {
          spyOn(imageProcessor, 'isFullImageExists').and.returnValue(true);
          spyOn(cache, 'getCachedThumbnailImage').and.returnValue(null);
          spyOn(imageProcessor, 'resizeImage').and.resolveTo(
               FAKE_THUMBNAIL_PATH,
          );
     });

     describe('when the source image does not exist', () => {
          it('returns 404 with a descriptive error message', async () => {
               (
                    imageProcessor.isFullImageExists as jasmine.Spy
               ).and.returnValue(false);

               const res = await request.get(`${BASE_URL}${QUERY}`);

               expect(res.status).toBe(404);
               expect(imageProcessor.isFullImageExists).toHaveBeenCalledWith(
                    'testImage',
               );
          });
     });

     describe('when a cached thumbnail already exists', () => {
          it('serves from cache and skips resizing', async () => {
               (cache.getCachedThumbnailImage as jasmine.Spy).and.returnValue(
                    FAKE_THUMBNAIL_PATH,
               );

               await request.get(`${BASE_URL}${QUERY}`);

               expect(cache.getCachedThumbnailImage).toHaveBeenCalledWith(
                    'testImage',
                    200,
                    150,
               );
               expect(imageProcessor.resizeImage).not.toHaveBeenCalled();
          });
     });

     describe('when no cache exists and resizeImage resolves', () => {
          it('calls resizeImage with the correct parameters', async () => {
               await request.get(`${BASE_URL}${QUERY}`);

               expect(imageProcessor.resizeImage).toHaveBeenCalledWith({
                    filename: 'testImage',
                    width: 200,
                    height: 150,
               });
          });

          it('returns 404 without calling resizeImage when the source image is missing', async () => {
               (
                    imageProcessor.isFullImageExists as jasmine.Spy
               ).and.returnValue(false);

               const res = await request.get(
                    `${BASE_URL}?width=200&height=150`,
               );

               expect(res.status).toBe(404);
               expect(imageProcessor.resizeImage).not.toHaveBeenCalled();
          });
     });

     describe('when resizeImage rejects', () => {
          it('returns 500 with the error message', async () => {
               (imageProcessor.resizeImage as jasmine.Spy).and.rejectWith(
                    new Error('Source image not found: testImage.jpg'),
               );

               const res = await request.get(`${BASE_URL}${QUERY}`);

               expect(res.status).toBe(500);
          });

          it('returns 500 with a generic message for non-Error rejections', async () => {
               (imageProcessor.resizeImage as jasmine.Spy).and.rejectWith(
                    'oops',
               );

               const res = await request.get(`${BASE_URL}${QUERY}`);

               expect(res.status).toBe(500);
               expect(res.body.error).toBe(
                    'Unknown error during image processing',
               );
          });
     });

     describe('query parameter parsing', () => {
          it('coerces width and height to numbers before forwarding them', async () => {
               await request.get(
                    `${BASE_URL}?filename=fjord&width=320&height=240`,
               );

               expect(imageProcessor.isFullImageExists).toHaveBeenCalledWith(
                    'fjord',
               );
               expect(cache.getCachedThumbnailImage).toHaveBeenCalledWith(
                    'fjord',
                    320,
                    240,
               );
          });
     });
});
