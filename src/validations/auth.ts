import Joi from "joi";

const authValidators = {
  validateLogin: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      email: Joi.string().email().required().label("Email"),
      password: Joi.string().min(6).required().label("Password"),
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

  validateRegister: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      email: Joi.string().email().required().label("Email"),
      password: Joi.string().min(6).required().label("Password"),
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

export default authValidators;
