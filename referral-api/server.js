const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://kowshikvalipireddy:fEk9Qp42Rf4Uxqpn@cluster0.rawcqaj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',{   bufferCommands: false, // Disable command buffering
    bufferMaxEntries: 0,   // Disable command buffering
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    socketTimeoutMS: 45000, // Timeout for socket connection})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error: ', err));

const referralSchema = new mongoose.Schema({
  name: String,
  email: String,
  referredBy: String
});

const Referral = mongoose.model('Referral', referralSchema);

const transporter = nodemailer.createTransport({
  secure: true,
  service: 'gmail',
  port:587,
  auth: {
    user: process.env.EMAIL_USER , 
    pass: process.env.EMAIL_PASS   // Replace with a placeholder
  }
});

app.post('/referrals', async (req, res) => {
  const { name, email, referredBy } = req.body;

  if (!name || !email || !referredBy) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  const referral = new Referral({
    name,
    email,
    referredBy
  });

  try {
    await referral.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Referral Notification',
      text: `Hello ${name},\n\nYou have been referred by ${referredBy}.\n\nBest Regards,\nYour Company`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send({ error: 'An error occurred while sending the email' });
      } else {
        res.status(200).send({ message: 'Referral saved and email sent successfully', info });
      }
    });

  } catch (error) {
    console.error('Error saving referral:', error);
    res.status(500).send({ error: 'Failed to save referral' });
  }
});

app.get('/test-email', async (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'test@example.com',
    subject: 'Test Email',
    text: 'This is a test email.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending test email:', error);
      return res.status(500).send({ error: 'Failed to send email' });
    } else {
      res.status(200).send({ message: 'Email sent successfully', info });
    }
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
