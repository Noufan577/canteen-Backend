const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 } // <-- NEW
});

module.exports = mongoose.model('MenuItem', menuItemSchema);