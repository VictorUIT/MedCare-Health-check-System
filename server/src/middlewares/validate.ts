import { NextFunction, Request, Response } from 'express';
import { AnyObjectSchema, ValidationError } from 'yup';

//1. Khai báo Type & Hàm Wrapper (Higher-Order Function)
type ValidationSource = 'body' | 'query' | 'params';

// 2. Middleware validate dữ liệu đầu vào
export const validate = (schema: AnyObjectSchema, source: ValidationSource = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate dữ liệu đầu vào dựa trên schema và source (body, query, params)
      const validated = await schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true
      });

      // Gán dữ liệu đã được validate vào req để các middleware hoặc route handler tiếp theo có thể sử dụng
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
