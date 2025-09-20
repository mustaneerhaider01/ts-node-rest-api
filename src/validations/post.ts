import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const postValidators = {
  validateCreatePost: (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      title: Joi.string().required().label("Title"),
      content: Joi.string().required().label("Content"),
    });

    const { error } = schema.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
    });

    if (error) {
      return res.status(400).send({
        status: 400,
        success: false,
        message: error.details[0].message,
      });
    }
    next();
  },
};

export default postValidators;
