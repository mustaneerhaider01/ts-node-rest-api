import { NextFunction, Request, Response } from "express";
import {
  getPost,
  getPosts,
  savePost,
  deletePost,
  updatePost,
} from "../lib/post.js";
import { Post } from "../types/post.js";
import ApiError from "../lib/apiError.js";
import redisService from "../lib/redis.js";

const postController = {
  list: async (_: Request, res: Response, next: NextFunction) => {
    try {
      // Try to get from cache first
      let posts = await redisService.getPosts();

      if (!posts) {
        // Cache miss - get from database
        posts = getPosts();
        // Cache the result
        await redisService.setPosts(posts);
      }

      res.send({
        status: 200,
        success: true,
        message: "Posts fetched",
        data: {
          posts,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  get: async (
    req: Request<{ postId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId = Number(req.params.postId);

      // Try to get from cache first
      let post = await redisService.getPost(postId);

      if (!post) {
        // Cache miss - get from database
        post = getPost(postId);
        // Cache the result
        await redisService.setPost(postId, post);
      }

      res.send({
        status: 200,
        success: true,
        message: "Post fetched",
        data: {
          post,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  create: async (
    req: Request<{}, {}, Pick<Post, "title" | "content">>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const createdPostId = savePost(req.body.title, req.body.content);

      // Invalidate cache after creating a new post
      await redisService.invalidatePostCache();

      res.send({
        status: 200,
        success: true,
        message: "Post created",
        data: {
          postId: createdPostId,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  remove: async (
    req: Request<{ postId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId = Number(req.params.postId);
      const postIsDeleted = deletePost(postId);

      if (!postIsDeleted) {
        throw new ApiError(404, "Post not found");
      }

      // Invalidate cache after deleting a post
      await redisService.invalidatePostCache(postId);

      res.send({
        status: 200,
        success: true,
        message: "Post removed",
      });
    } catch (err) {
      next(err);
    }
  },

  edit: async (
    req: Request<{ postId: string }, {}, Pick<Post, "title" | "content">>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId = Number(req.params.postId);
      const postIsEditied = updatePost(postId, req.body);

      if (!postIsEditied) {
        throw new ApiError(404, "Post not found");
      }

      // Invalidate cache after editing a post
      await redisService.invalidatePostCache(postId);

      res.send({
        status: 200,
        success: true,
        message: "Post updated",
      });
    } catch (err) {
      next(err);
    }
  },
};

export default postController;
