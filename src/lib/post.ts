import sql from "better-sqlite3";
import ApiError from "./apiError.js";
import { Post } from "../types/post.js";

const db = sql("posts.db");

export const getPosts = () => {
  return db.prepare("SELECT * FROM posts").all() as Post[];
};

export const getPostsByIds = (ids: number[]) => {
  if (ids.length === 0) return [] as Post[];

  const placeholders = ids.map(() => "?").join(", ");
  const query = `SELECT * FROM posts WHERE id IN (${placeholders})`;

  return db.prepare(query).all(...ids) as Post[];
};

export const getPost = (postId: number) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return post as Post;
};

export const savePost = (title: string, content: string) => {
  const postData = {
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  const stmt = db.prepare(`
      INSERT INTO posts
        (title, content, createdAt)
      VALUES (
        @title,
        @content,
        @createdAt
      )
    `);

  const result = stmt.run(postData);

  return Number(result.lastInsertRowid);
};

export const deletePost = (postId: number) => {
  const result = db.prepare("DELETE FROM posts WHERE id = ?").run(postId);

  return result.changes === 1;
};

export const updatePost = (
  postId: number,
  data: Pick<Post, "title" | "content">
) => {
  const stmt = db.prepare(`
      UPDATE posts
      SET title = @title, content = @content
      WHERE id = @id
    `);

  const result = stmt.run({ ...data, id: postId });

  return result.changes === 1;
};
