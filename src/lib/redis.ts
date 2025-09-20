import { createClient } from "redis";
import jwt from "jsonwebtoken";

import { Post } from "../types/post.js";
import ApiError from "./apiError.js";

class RedisService {
  private client: ReturnType<typeof createClient>;
  private jwtSecret: string;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
    this.jwtSecret = process.env.JWT_SECRET!;
    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
      console.log("Connected to Redis");
    } catch (error) {
      console.error("Redis connection error:", error);
    }
  }

  // Cache operations for posts
  async getPosts(): Promise<Post[] | null> {
    try {
      const cached = await this.client.get("posts:all");
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting posts from cache:", error);
      return null;
    }
  }

  async setPosts(posts: Post[]): Promise<void> {
    try {
      await this.client.setEx("posts:all", 3600, JSON.stringify(posts)); // Cache for 1 hour
    } catch (error) {
      console.error("Error setting posts in cache:", error);
    }
  }

  async getPost(postId: number): Promise<Post | null> {
    try {
      const cached = await this.client.get(`posts:${postId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting post from cache:", error);
      return null;
    }
  }

  async setPost(postId: number, post: Post): Promise<void> {
    try {
      await this.client.setEx(`posts:${postId}`, 3600, JSON.stringify(post)); // Cache for 1 hour
    } catch (error) {
      console.error("Error setting post in cache:", error);
    }
  }

  async invalidatePostCache(postId?: number): Promise<void> {
    try {
      // Invalidate all posts cache
      await this.client.del("posts:all");

      // Invalidate specific post cache if postId provided
      if (postId) {
        await this.client.del(`posts:${postId}`);
      }
    } catch (error) {
      console.error("Error invalidating post cache:", error);
    }
  }

  // JWT Session management
  async createSession(userId: string, userData: any): Promise<string> {
    try {
      const token = jwt.sign({ userId, ...userData }, this.jwtSecret, {
        expiresIn: "24h",
      });

      // Store session in Redis with expiration
      await this.client.setEx(
        `session:${userId}`,
        86400,
        JSON.stringify({
          userId,
          ...userData,
          createdAt: new Date().toISOString(),
        })
      );

      return token;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  async validateSession(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const sessionData = await this.client.get(`session:${decoded.userId}`);

      if (!sessionData) {
        throw new ApiError(401, "Not authenticated");
      }

      return JSON.parse(sessionData);
    } catch (error) {
      console.error("Error validating session:", error);
      throw error;
    }
  }

  async invalidateSession(userId: string): Promise<void> {
    try {
      await this.client.del(`session:${userId}`);
    } catch (error) {
      console.error("Error invalidating session:", error);
    }
  }

  async refreshSession(userId: string): Promise<void> {
    try {
      const sessionData = await this.client.get(`session:${userId}`);
      if (sessionData) {
        // Extend session expiration
        await this.client.setEx(`session:${userId}`, 86400, sessionData);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  }

  /**
   * @param key - unique identifier (e.g. userId, IP address)
   * @param limit - max number of requests allowed
   * @param windowSeconds - time window in seconds
   * @returns true if rate limited, false otherwise
   */
  async isRateLimited(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<boolean> {
    try {
      const redisKey = `rate:${key}`;

      // Increment the count
      const requests = await this.client.incr(redisKey);

      if (requests === 1) {
        // First request → set expiration
        await this.client.expire(redisKey, windowSeconds);
      }

      return requests > limit;
    } catch (error) {
      console.error("Error checking rate limit:", error);
      return false; // fail-open strategy
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      console.error("Error checking connection to Redis:", error);
      return false;
    }
  }

  disconnect() {
    try {
      this.client.destroy();
      console.log("Disconnected from Redis");
    } catch (error) {
      console.error("Error disconnecting from Redis:", error);
    }
  }
}

// Export singleton instance
export const redisService = new RedisService();
export default redisService;
