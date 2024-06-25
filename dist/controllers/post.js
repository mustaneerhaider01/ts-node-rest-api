import { getPost, getPosts, savePost, deletePost, updatePost, } from "../lib/post.js";
const postController = {
    list: (_, res, next) => {
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
        }
        catch (err) {
            next(err);
        }
    },
    get: (req, res, next) => {
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
        }
        catch (err) {
            next(err);
        }
    },
    create: (req, res, next) => {
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
        }
        catch (err) {
            next(err);
        }
    },
    remove: (req, res, next) => {
        try {
            deletePost(Number(req.params.postId));
            res.send({
                status: 200,
                success: true,
                message: "Post removed",
            });
        }
        catch (err) {
            next(err);
        }
    },
    edit: (req, res, next) => {
        try {
            updatePost(Number(req.params.postId), req.body);
            res.send({
                status: 200,
                success: true,
                message: "Post updated",
            });
        }
        catch (err) {
            next(err);
        }
    },
};
export default postController;
