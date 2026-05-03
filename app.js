const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
require('dotenv').config();
const { attachCurrentUser } = require('./middleware/auth');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(attachCurrentUser);

// Set shared locals for views
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.title = 'Task Management System';
  next();
});

// Set view engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('views', path.join(__dirname, 'views'));

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/projects', projectRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'Task Management System' });
});

const startServer = async () => {
  await connectToDatabase();

  const PORT = process.env.PORT || 3000;
  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open the app at http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch(() => {
    process.exit(1);
  });
}

module.exports = { app, connectToDatabase, startServer };
