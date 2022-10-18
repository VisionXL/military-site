const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        rank: Joi.string().required().escapeHTML(),
        age: Joi.number().required().min(0),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        isActive: Joi.string(),
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        author: Joi.string().required().escapeHTML(),
        email: Joi.string().required().escapeHTML(),
        number: Joi.number().required(),
        address: Joi.string().required().escapeHTML(),
        ssn: Joi.string().required(),
        leaveType: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
    }).required()
})

