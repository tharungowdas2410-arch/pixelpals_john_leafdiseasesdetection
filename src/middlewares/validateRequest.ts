import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateBody = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({ message: "Validation failed", errors: error.errors });
      }
      return res.status(400).json({ message: "Invalid request" });
    }
  };
};

