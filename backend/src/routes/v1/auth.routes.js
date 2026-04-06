const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, getMe, updateUserRole, getUsers } = require('../../controllers/auth.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/role.middleware');
const ErrorResponse = require('../../utils/errorResponse');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }
  next();
};

router.post(
  '/register',
  [
    body('name', 'Please add a name').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validate
  ],
  register
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
    validate
  ],
  login
);

router.get('/me', authMiddleware, getMe);

// Admin-only routes
router.get(
  '/users',
  [authMiddleware, roleMiddleware('Admin')],
  getUsers
);

router.put(
  '/users/:id/role',
  [authMiddleware, roleMiddleware('Admin')],
  updateUserRole
);

module.exports = router;
