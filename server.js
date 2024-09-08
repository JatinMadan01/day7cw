const express = require('express');
const mongoose = require('mongoose');
const ShortUniqueId = require('short-unique-id');
const bodyParser = require('body-parser');

const app = express();
const uid = new ShortUniqueId({ length: 6 });

// Connect to MongoDB
mongoose.connect('mongodb://localhost/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortCode: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

const Url = mongoose.model('Url', urlSchema);

app.use(bodyParser.json());

// Endpoint to shorten URL
app.post('/shorten', async (req, res) => {
  try {
    const { originalUrl, expiresAt } = req.body;
    const shortCode = uid();
    const url = new Url({ originalUrl, shortCode, expiresAt });
    await url.save();
    res.json({ shortUrl: `http://localhost:3000/${shortCode}` });
  } catch (error) {
    res.status(500).send('Error creating short URL');
  }
});

// Endpoint to redirect
app.get('/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });
    if (url) {
      if (url.expiresAt && new Date() > url.expiresAt) {
        return res.status(404).send('URL expired');
      }
      res.redirect(url.originalUrl);
    } else {
      res.status(404).send('URL not found');
    }
  } catch (error) {
    res.status(500).send('Error redirecting URL');
  }
});
const path = require('path');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));


app.listen(3000, () => {
  console.log('URL Shortener running on http://localhost:3000');
});
