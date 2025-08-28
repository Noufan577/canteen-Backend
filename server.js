require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Parser } = require('json2csv');

// --- Import Routes and Middleware ---
const authMiddleware = require('./middleware');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// --- Import Models ---
const MenuItem = require('./models/menuItem');
const Order = require('./models/order');

const app = express();
const PORT = 3000;

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());

// --- API Routes Setup ---
// All your routes should be grouped here
app.use('/api/auth', authRoutes);
app.use('/api/admin', authMiddleware(['manager']), adminRoutes); // This is now in the correct place

// --- Database Connection ---
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/canteenDB')
  .then(() => console.log('✅ Database connected'))
  .catch((err) => console.error('❌ DB connection error:', err));

// --- Public & Protected Routes defined directly on app ---

// GET ALL MENU ITEMS (Public)
app.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE A NEW MENU ITEM (Protected - Manager Only)
app.post('/api/menu', authMiddleware(['manager']), async (req, res) => {
  const newItem = new MenuItem({
    name: req.body.name,
    price: req.body.price,
    imageUrl: req.body.imageUrl,
    category: req.body.category,
    quantity: req.body.quantity
  });
  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE A MENU ITEM (Protected - Manager Only)
app.put('/api/menu/:id', authMiddleware(['manager']), async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE A MENU ITEM (Protected - Manager Only)
app.delete('/api/menu/:id', authMiddleware(['manager']), async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted menu item' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE A NEW ORDER (Public)
app.post('/api/checkout', async (req, res) => {
  const { items, totalAmount } = req.body;
  try {
    for (const item of items) {
      const menuItem = await MenuItem.findOne({ name: item.name });
      if (!menuItem || menuItem.quantity < item.quantity) {
        return res.status(400).json({ message: `Sorry, ${item.name} is sold out or not enough in stock!` });
      }
    }
    const newOrder = new Order({ items, totalAmount, status: 'Paid' });
    const savedOrder = await newOrder.save();
    for (const item of items) {
      await MenuItem.updateOne({ name: item.name }, { $inc: { quantity: -item.quantity } });
    }
    res.status(201).json({ message: "Order created successfully!", orderId: savedOrder._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

// VERIFY AND REDEEM A QR CODE (Protected - Staff/Manager)
app.post('/api/orders/scan', authMiddleware(['staff', 'manager']), async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Invalid QR Code. Order not found.' });
    if (order.status === 'Redeemed') return res.status(400).json({ message: 'This order has already been redeemed.' });
    if (order.status !== 'Paid') return res.status(400).json({ message: 'This order has not been paid for yet.' });
    order.status = 'Redeemed';
    await order.save();
    res.status(200).json({ message: 'Order Redeemed Successfully!', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error during scan.' });
  }
});

// --- Server Start ---
app.listen(PORT, () => console.log(`🚀 Backend server running on port ${PORT}`));