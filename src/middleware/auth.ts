import { Request, Response, NextFunction } from "express";
import redisService from "../lib/redis.js";
import ApiError from "../lib/apiError.js";

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        [key: string]: any;
      };
    }
  }
}

const extractTokenFromHeader = (req: Request) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  return token;
};

export const authenticateToken = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      throw new ApiError(401, "Access token required");
    }

    const userData = await redisService.validateSession(token);
    req.user = userData;
    next();
  } catch (error) {
    next(error);
  }
};
