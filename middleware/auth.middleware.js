const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Form = require('../models/form.model');

// Middleware to verify the JWT token from the request header
const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  // Clean up "Bearer " prefix if it exists
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized! Invalid Token.' });
    }
    // Attach the decoded user ID to the request object
    req.userId = decoded.id;
    next();
  });
};

// Middleware to check if the user is the owner of the form
const isOwner = async (req, res, next) => {
    try {
        const formId = req.params.id;
        const form = await Form.findById(formId);

        if (!form) {
            return res.status(404).send({ message: "Form not found." });
        }

        // Check if the 'createdBy' field matches the logged-in user's ID
        if (form.createdBy.toString() !== req.userId) {
            return res.status(403).send({ message: "Access denied. You are not the owner of this form." });
        }

        // If the user is the owner, proceed to the next middleware/controller
        next();
    } catch (error) {
        console.error("Ownership check error:", error);
        // Handle potential CastError if the formId is invalid
        if (error.name === 'CastError') {
            return res.status(400).send({ message: "Invalid form ID." });
        }
        return res.status(500).send({ message: "An error occurred while verifying ownership." });
    }
};


const authMiddleware = {
  verifyToken,
  isOwner,
};

module.exports = authMiddleware;