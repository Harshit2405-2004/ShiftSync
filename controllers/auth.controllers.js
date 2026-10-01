const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Controller for user registration
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).send({ message: "Username and password are required." });
    }

    const user = new User({
      username,
      password: bcrypt.hashSync(password, 8), // Hash the password
      role, // role can be 'operator' or 'supervisor'
    });

    await user.save();
    res.status(201).send({ message: 'User was registered successfully!' });
  } catch (error) {
    // Handle duplicate username error
    if (error.code === 11000) {
        return res.status(400).send({ message: "Failed! Username is already in use!" });
    }
    res.status(500).send({ message: error.message });
  }
};

// Controller for user login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Invalid Password!',
      });
    }

    // Generate a token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res.status(200).send({
      id: user._id,
      username: user.username,
      role: user.role,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
