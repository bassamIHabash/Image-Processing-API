import { Request, Response, NextFunction } from 'express';
import validateImageParams from '../../middleware/validateParams';

const makeReq = (query: Record<string, string> = {}): Partial<Request> => ({
     query,
});

const makeRes = () => {
     const res = {} as Response;
     res.status = jasmine.createSpy('status').and.returnValue(res);
     res.json = jasmine.createSpy('json').and.returnValue(res);
     return res;
};

const makeNext = (): NextFunction =>
     jasmine.createSpy('next') as unknown as NextFunction;

describe('validateImageParams middleware', () => {
     let res: Response;
     let next: NextFunction;

     beforeEach(() => {
          res = makeRes();
          next = makeNext();
     });

     describe('when required query parameters are missing', () => {
          it('returns 400 when filename is absent', () => {
               validateImageParams(
                    makeReq({ width: '200', height: '150' }) as Request,
                    res,
                    next,
               );

               expect(res.status).toHaveBeenCalledWith(400);
               expect(
                    (res.json as jasmine.Spy).calls.mostRecent().args[0].error,
               ).toContain('filename');
               expect(next).not.toHaveBeenCalled();
          });

          it('returns 400 when width is absent', () => {
               validateImageParams(
                    makeReq({ filename: 'fjord', height: '150' }) as Request,
                    res,
                    next,
               );

               expect(res.status).toHaveBeenCalledWith(400);
               expect(
                    (res.json as jasmine.Spy).calls.mostRecent().args[0].error,
               ).toContain('width');
               expect(next).not.toHaveBeenCalled();
          });

          it('returns 400 when height is absent', () => {
               validateImageParams(
                    makeReq({ filename: 'fjord', width: '200' }) as Request,
                    res,
                    next,
               );

               expect(res.status).toHaveBeenCalledWith(400);
               expect(
                    (res.json as jasmine.Spy).calls.mostRecent().args[0].error,
               ).toContain('height');
               expect(next).not.toHaveBeenCalled();
          });
     });

     describe('when width or height are invalid', () => {
          it('returns 400 when width is not a number', () => {
               validateImageParams(
                    makeReq({
                         filename: 'fjord',
                         width: 'abc',
                         height: '150',
                    }) as Request,
                    res,
                    next,
               );

               expect(res.status).toHaveBeenCalledWith(400);
               expect(
                    (res.json as jasmine.Spy).calls.mostRecent().args[0].error,
               ).toContain('width');
               expect(next).not.toHaveBeenCalled();
          });

          it('returns 400 when width is zero', () => {
               validateImageParams(
                    makeReq({
                         filename: 'fjord',
                         width: '0',
                         height: '150',
                    }) as Request,
                    res,
                    next,
               );
               expect(res.status).toHaveBeenCalledWith(400);
               expect(next).not.toHaveBeenCalled();
          });

          it('returns 400 when width is negative', () => {
               validateImageParams(
                    makeReq({
                         filename: 'fjord',
                         width: '-100',
                         height: '150',
                    }) as Request,
                    res,
                    next,
               );
               expect(res.status).toHaveBeenCalledWith(400);
               expect(next).not.toHaveBeenCalled();
          });

          it('returns 400 when height is not a number', () => {
               validateImageParams(
                    makeReq({
                         filename: 'fjord',
                         width: '200',
                         height: 'xyz',
                    }) as Request,
                    res,
                    next,
               );

               expect(res.status).toHaveBeenCalledWith(400);
               expect(
                    (res.json as jasmine.Spy).calls.mostRecent().args[0].error,
               ).toContain('height');
               expect(next).not.toHaveBeenCalled();
          });

          it('returns 400 when height is zero', () => {
               validateImageParams(
                    makeReq({
                         filename: 'fjord',
                         width: '200',
                         height: '0',
                    }) as Request,
                    res,
                    next,
               );
               expect(res.status).toHaveBeenCalledWith(400);
               expect(next).not.toHaveBeenCalled();
          });

          it('returns 400 when height is negative', () => {
               validateImageParams(
                    makeReq({
                         filename: 'fjord',
                         width: '200',
                         height: '-50',
                    }) as Request,
                    res,
                    next,
               );
               expect(res.status).toHaveBeenCalledWith(400);
               expect(next).not.toHaveBeenCalled();
          });
     });

     describe('when the filename contains invalid characters', () => {
          it('returns 400 for path traversal characters', () => {
               validateImageParams(
                    makeReq({
                         filename: '../secret',
                         width: '200',
                         height: '150',
                    }) as Request,
                    res,
                    next,
               );

               expect(res.status).toHaveBeenCalledWith(400);
               expect(
                    (res.json as jasmine.Spy).calls.mostRecent().args[0].error,
               ).toContain('Invalid filename');
               expect(next).not.toHaveBeenCalled();
          });

          it('returns 400 when the filename contains spaces', () => {
               validateImageParams(
                    makeReq({
                         filename: 'my image',
                         width: '200',
                         height: '150',
                    }) as Request,
                    res,
                    next,
               );
               expect(res.status).toHaveBeenCalledWith(400);
               expect(next).not.toHaveBeenCalled();
          });

          it('returns 400 when the filename contains special characters', () => {
               validateImageParams(
                    makeReq({
                         filename: 'img@2x!',
                         width: '200',
                         height: '150',
                    }) as Request,
                    res,
                    next,
               );
               expect(res.status).toHaveBeenCalledWith(400);
               expect(next).not.toHaveBeenCalled();
          });
     });

     describe('when all parameters are valid', () => {
          it('calls next() and does not send a response', () => {
               validateImageParams(
                    makeReq({
                         filename: 'encenadaport',
                         width: '400',
                         height: '300',
                    }) as Request,
                    res,
                    next,
               );

               expect(next).toHaveBeenCalled();
               expect(res.status).not.toHaveBeenCalled();
          });

          it('accepts filenames with underscores and hyphens', () => {
               validateImageParams(
                    makeReq({
                         filename: 'my_image-v2',
                         width: '800',
                         height: '600',
                    }) as Request,
                    res,
                    next,
               );

               expect(next).toHaveBeenCalled();
               expect(res.status).not.toHaveBeenCalled();
          });

          it('accepts minimum valid dimensions (1x1)', () => {
               validateImageParams(
                    makeReq({
                         filename: 'fjord',
                         width: '1',
                         height: '1',
                    }) as Request,
                    res,
                    next,
               );
               expect(next).toHaveBeenCalled();
          });
     });
});
