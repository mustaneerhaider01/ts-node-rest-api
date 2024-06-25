import { Router } from "express";

import postController from "../controllers/post.js";
import postValidators from "../validations/post.js";

const router = Router();

router.get("/list", postController.list);
router.get("/:postId", postController.get);
router.post(
  "/create",
  postValidators.validateCreatePost,
  postController.create
);
router.delete("/:postId/remove", postController.remove);
router.put(
  "/:postId/edit",
  postValidators.validateCreatePost,
  postController.edit
);

export default router;
