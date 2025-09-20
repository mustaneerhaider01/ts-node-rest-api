import { Request, Response, NextFunction } from "express";
import redisService from "../lib/redis.js";
import ApiError from "../lib/apiError.js";

export const rateLimiter = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const userKey = req.ip!; // or req.user.id if logged in
    const isLimited = await redisService.isRateLimited(userKey, 5, 60); // 5 req/min

    if (isLimited) {
      throw new ApiError(429, "Too many requests, please try again later.");
    }
    next();
  } catch (error) {
    next(error);
  }
};
