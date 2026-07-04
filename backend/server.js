require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ── Import Routes ──────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
// NOTE: Other module routes (attendance, leave, payroll, etc.) should be
// imported and mounted here by respective teammates. Do NOT modify above routes.

const app = express();

// ── Connect to MongoDB ─────────────────────────────────────────────────────────
connectDB();

// ── Middlewares ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HRMS API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Mount Auth Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 HRMS Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
