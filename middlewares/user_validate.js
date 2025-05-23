const { body, validationResult } = require("express-validator");

exports.validateSignup = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

    body("phone_number")
    .matches(/^\d{10,12}$/)
    .withMessage("Phone number must be a number with 10 to 12 digits"),
  
  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 2 })
    .withMessage("Write your city name"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
