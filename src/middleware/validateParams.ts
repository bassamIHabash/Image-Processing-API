import { Request, Response, NextFunction } from 'express';

export interface ImageQueryParams {
     filename: string;
     width: number;
     height: number;
}

const validateImageParams = (
     req: Request,
     res: Response,
     next: NextFunction,
): void => {
     const { filename, width, height } = req.query;

     if (!filename) {
          res.status(400).json({
               error: 'Missing required parameter: filename',
          });
          return;
     }

     if (!width) {
          res.status(400).json({ error: 'Missing required parameter: width' });
          return;
     }

     if (!height) {
          res.status(400).json({ error: 'Missing required parameter: height' });
          return;
     }

     const parsedWidth = parseInt(width as string, 10);
     const parsedHeight = parseInt(height as string, 10);

     if (isNaN(parsedWidth) || parsedWidth <= 0) {
          res.status(400).json({
               error: 'Parameter "width" must be a positive integer',
          });
          return;
     }

     if (isNaN(parsedHeight) || parsedHeight <= 0) {
          res.status(400).json({
               error: 'Parameter "height" must be a positive integer',
          });
          return;
     }

     const sanitizedFilename = (filename as string).replace(
          /[^a-zA-Z0-9_-]/g,
          '',
     );
     if (sanitizedFilename !== filename) {
          res.status(400).json({
               error: 'Invalid filename. Only alphanumeric characters, underscores, and hyphens are allowed.',
          });
          return;
     }

     next();
};

export default validateImageParams;
