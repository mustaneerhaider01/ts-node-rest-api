import express from "express";
import postRouter from "./routes/post.js";
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb", parameterLimit: 50000 }));
app.get("/", (_, res) => {
    res.send({
        status: 200,
        success: true,
        message: "Hello World!",
    });
});
app.use("/api/posts", postRouter);
app.use((err, _, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    return res.status(err.status || 500).send({
        status: err.status || 500,
        success: false,
        message: err.message,
    });
});
app.listen(process.env.PORT, () => {
    console.log(`Server running on PORT:${process.env.PORT}`);
});
