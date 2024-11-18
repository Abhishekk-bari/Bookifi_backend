const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create the Express app
const app = express();

// Middleware
app.use(cors()); // To allow cross-origin requests from your React app
app.use(bodyParser.json()); // To parse JSON data in requests

// MongoDB URI
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define a schema for visitor booking
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model('Booking', bookingSchema);

// API endpoint to handle form submission
app.post('/submit-form', async (req, res) => {
  try {
    const { name, email, phone, appointmentDate } = req.body;

    // Validate input
    if (!name || !email || !phone || !appointmentDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create a new booking document
    const newBooking = new Booking({
      name,
      email,
      phone,
      appointmentDate,
    });

    // Save the booking in MongoDB
    await newBooking.save();

    res.status(201).json({ message: 'Booking successfully submitted!' });
  } catch (error) {
    console.error('Error saving booking data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to fetch all bookings (GET) for the admin
app.get('/admin/bookings', async (req, res) => {
  try {
    // Fetch all bookings from the database
    const bookings = await Booking.find(); // Retrieves all bookings
    res.status(200).json(bookings); // Return the bookings as JSON
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});


// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});