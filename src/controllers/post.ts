import { NextFunction, Request, Response } from "express";
import {
  getPost,
  getPosts,
  savePost,
  deletePost,
  updatePost,
  getPostsByIds,
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
      const { title, content } = req.body;

      const createdPostId = savePost(title, content);

      // Invalidate cache after creating a new post
      // Enable searching for this post via title
      await Promise.all([
        redisService.invalidatePostCache(),
        redisService.addToSearchIndex(createdPostId, title),
      ]);

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

      const post = getPost(postId);

      if (!post) {
        throw new ApiError(404, "Post not found");
      }

      const postIsDeleted = deletePost(postId);

      if (!postIsDeleted) {
        throw new ApiError(404, "Couldn't delete the post");
      }

      // Invalidate cache after deleting a post
      // Remove post title from search index
      await Promise.all([
        redisService.invalidatePostCache(postId),
        redisService.removeFromSearchIndex(postId, post.title),
      ]);

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

      // Use distributed locking to prevent concurrent updates
      await redisService.withLock(
        `post:update:${postId}`,
        async () => {
          const postIsEdited = updatePost(postId, req.body);

          const post = getPost(postId);

          if (!post) {
            throw new ApiError(404, "Post not found");
          }

          if (!postIsEdited) {
            throw new ApiError(404, "Couldn't update the post");
          }

          // Invalidate cache after editing a post
          await redisService.invalidatePostCache(postId);

          // Remove existing index for old title and add for new title
          await redisService.removeFromSearchIndex(postId, post.title);
          await redisService.addToSearchIndex(postId, req.body.title);
        },
        3000, // Lock for 3 seconds
        100, // Retry every 100ms
        3 // Max 3 retries
      );

      res.send({
        status: 200,
        success: true,
        message: "Post updated",
      });
    } catch (err) {
      next(err);
    }
  },

  search: async (
    req: Request<{}, {}, {}, { search?: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search } = req.query;

      if (!search) {
        throw new ApiError(400, "Search query is missing");
      }

      const postIds = await redisService.searchPosts(search);
      const posts = getPostsByIds(postIds);

      res.send({
        status: 200,
        success: true,
        message: "Posts fetched",
        data: {
          posts,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default postController;
