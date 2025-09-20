import { Router } from "express";

import postController from "../controllers/post.js";
import postValidators from "../validations/post.js";
import { authenticateToken } from "../middleware/auth.js";
import { rateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.get("/list", authenticateToken, postController.list);
router.get("/:postId", authenticateToken, postController.get);
router.post(
  "/create",
  authenticateToken,
  rateLimiter,
  postValidators.validateCreatePost,
  postController.create
);
router.delete("/:postId/remove", authenticateToken, postController.remove);
router.put(
  "/:postId/edit",
  authenticateToken,
  postValidators.validateCreatePost,
  postController.edit
);

export default router;
