import { Request, Response, NextFunction } from "express";
import postValidationSchemas from "./schemas/post.js";
import ApiError from "../lib/apiError.js";

const postValidators = {
  validateCreatePost: (req: Request, _: Response, next: NextFunction) => {
    const { error } = postValidationSchemas.validateCreatePost.validate(
      req.body,
      {
        errors: { label: "key", wrap: { label: false } },
      }
    );

    if (error) {
      throw new ApiError(400, error.details[0].message);
    } else {
      next();
    }
  },
};

export default postValidators;
