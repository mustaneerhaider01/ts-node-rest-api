import { Request, Response, NextFunction } from "express";
import redisService from "../lib/redis.js";
import ApiError from "../lib/apiError.js";
import { getUserByEmail, validatePassword, createUser } from "../lib/user.js";
import { AuthRequest } from "../types/user.js";

const authController = {
  login: async (
    req: Request<{}, {}, AuthRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;

      // Find user in database
      const user = getUserByEmail(email);
      if (!user) {
        throw new ApiError(401, "Invalid credentials");
      }

      // Validate password
      const isValidPassword = await validatePassword(password, user.password);
      if (!isValidPassword) {
        throw new ApiError(401, "Invalid credentials");
      }

      // Create session
      const token = await redisService.createSession(user.id.toString(), {
        email: user.email,
      });

      res.send({
        status: 200,
        success: true,
        message: "Login successful",
        data: {
          token,
          userId: user.id,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  register: async (
    req: Request<{}, {}, AuthRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = getUserByEmail(email);
      if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
      }

      // Create new user
      const userId = await createUser(email, password);

      res.send({
        status: 201,
        success: true,
        message: "User registered successfully",
        data: {
          userId,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Not authenticated");
      }

      await redisService.invalidateSession(req.user.userId);

      res.send({
        status: 200,
        success: true,
        message: "Logout successful",
      });
    } catch (err) {
      next(err);
    }
  },

  profile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Not authenticated");
      }

      res.send({
        status: 200,
        success: true,
        message: "Profile fetched",
        data: {
          user: req.user,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Not authenticated");
      }

      await redisService.refreshSession(req.user.userId);

      res.send({
        status: 200,
        success: true,
        message: "Session refreshed",
      });
    } catch (err) {
      next(err);
    }
  },
};

export default authController;
