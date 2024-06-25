import sql from "better-sqlite3";
import ApiError from "./apiError.js";
const db = sql("posts.db");
export const getPosts = () => {
    return db.prepare("SELECT * FROM posts").all();
};
export const getPost = (postId) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }
    return post;
};
export const savePost = (title, content) => {
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
    return result.lastInsertRowid;
};
export const deletePost = (postId) => {
    const result = db.prepare("DELETE FROM posts WHERE id = ?").run(postId);
    if (!result.changes) {
        throw new ApiError(404, "Post not found");
    }
    return true;
};
export const updatePost = (postId, data) => {
    const stmt = db.prepare(`
      UPDATE posts
      SET title = @title, content = @content
      WHERE id = @id
    `);
    const result = stmt.run({ ...data, id: postId });
    if (!result.changes) {
        throw new ApiError(404, "Post not found");
    }
    return true;
};
