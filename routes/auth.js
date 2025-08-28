const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// REGISTER (For one-time setup)
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!['manager', 'staff'].includes(role)) {
      return res.status(400).send({ error: 'Invalid role.' });
    }
    const user = new User({ email, password, role });
    await user.save();
    res.status(201).send({ message: 'User created successfully' });
  } catch (error) { res.status(400).send({ error: error.message }); }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.send({ user: { email: user.email, role: user.role }, token });
  } catch (error) { res.status(500).send({ error: 'Internal server error' }); }
});

module.exports = router;