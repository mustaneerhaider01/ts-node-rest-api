import { NextFunction, Request, Response } from "express";
import {
  getPost,
  getPosts,
  savePost,
  deletePost,
  updatePost,
} from "../lib/post.js";
import { Post } from "../types/post.js";

const postController = {
  list: (_: Request, res: Response, next: NextFunction) => {
    try {
      const posts = getPosts();

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
  get: (
    req: Request<{ postId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const post = getPost(Number(req.params.postId));

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
  create: (
    req: Request<{}, {}, Pick<Post, "title" | "content">>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const createdPostId = savePost(req.body.title, req.body.content);

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
  remove: (
    req: Request<{ postId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      deletePost(Number(req.params.postId));

      res.send({
        status: 200,
        success: true,
        message: "Post removed",
      });
    } catch (err) {
      next(err);
    }
  },
  edit: (
    req: Request<{ postId: string }, {}, Pick<Post, "title" | "content">>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      updatePost(Number(req.params.postId), req.body);

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
