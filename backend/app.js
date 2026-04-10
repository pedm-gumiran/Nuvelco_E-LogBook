const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
// const { authenticate } = require('./middleware/authMiddleware');
const adminRoutes = require('./routes/adminRoutes.js');
const internRoutes = require('./routes/internRoutes.js');
const schoolRoutes = require('./routes/schoolRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const pincodeRoutes = require('./routes/pincodeRoutes.js');
const internAttendanceRoutes = require('./routes/internAttendanceRoutes.js');
const visitorAttendanceRoutes = require('./routes/visitorAttendanceRoutes.js');
const backupRoutes = require('./routes/backupRoutes.js');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(morgan('dev'));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/intern', internRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/intern-attendance', internAttendanceRoutes);
app.use('/api/visitor-attendance', visitorAttendanceRoutes);
app.use('/api/backup', backupRoutes);

app.get('/', (req, res) => res.send('Server is Ready!'));

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
