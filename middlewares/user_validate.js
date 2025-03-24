const { body, validationResult } = require("express-validator");

exports.validateSignup = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("phone_number")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),

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

    // **Prepend "91" before storing**
    req.body.phone_number = `91${req.body.phone_number}`;
    
    next();
  },
];
