const express = require('express');
const User = require('../models/user');
const router = express.Router();

// GET ALL USERS (for the manager to see)
router.get('/users', async (req, res) => {
  try {
    // Find all users that are not managers
    const users = await User.find({ role: { $ne: 'manager' } });
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

// DISMISS (DELETE) A STAFF MEMBER
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send({ message: 'User dismissed successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Add this inside backend/routes/admin.js

// RESET (UPDATE) A USER'S PASSWORD
router.patch('/users/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).send({ error: 'Password must be at least 6 characters long.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    user.password = password; // Set the new password
    await user.save(); // The pre-save hook in the model will hash it automatically
    res.send({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;