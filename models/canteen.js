const mongoose = require('mongoose');

const canteenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // This will be used to create the public URL, e.g., your-app.com/canteens/kochi-campus
  urlSlug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This links the canteen to a specific manager/owner account
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Canteen', canteenSchema);
