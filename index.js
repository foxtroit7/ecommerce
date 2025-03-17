const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const categoryRoutes = require('./routes/categoryRoutes')
const adminRoutes = require('./routes/adminRoutes')
const contactRoutes = require('./routes/contactRoutes')
const privacyRoutes = require('./routes/privacyRoutes')
const termsRoutes = require('./routes/termsRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
require('dotenv').config();  
const path = require('path');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB using the URI from .env
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', categoryRoutes);
app.use('/api', adminRoutes);
app.use('/api', contactRoutes);
app.use('/api', privacyRoutes);
app.use('/api', termsRoutes);
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', bookingRoutes);
app.listen(5000, () => {
    console.log('Hello');
});
