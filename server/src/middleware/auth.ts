import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { AppError } from "./errorHandler";

interface AuthenticatedRequest extends Request {
  user: {
    _id: Types.ObjectId;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new AppError("Authentication token required", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      _id: string;
    };
    req.user = {
      _id: new Types.ObjectId(decoded._id),
    };
    next();
  } catch (error) {
    return next(new AppError("Invalid token", 401));
  }
};
