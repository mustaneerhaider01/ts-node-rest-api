import Joi from "joi";
const postValidationSchemas = {
    validateCreatePost: Joi.object({
        title: Joi.string().required().label("Title"),
        content: Joi.string().required().label("Content"),
    }),
};
export default postValidationSchemas;
