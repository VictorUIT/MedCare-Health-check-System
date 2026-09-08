import { NextFunction, Request, Response } from 'express';
import { AnyObjectSchema, ValidationError } from 'yup';

type ValidationSource = 'body' | 'query' | 'params';

export const validate = (schema: AnyObjectSchema, source: ValidationSource = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true
      });

      (req as Request & Record<ValidationSource, unknown>)[source] = validated;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          message: 'Dữ liệu đầu vào không hợp lệ',
          errors: error.inner.map((item) => ({
            field: item.path,
            message: item.message
          }))
        });
      }

      next(error);
    }
  };
};
