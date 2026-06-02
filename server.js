const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ Website A ki upstream URL yahan set karein (Ya environment variable use karein)
const WEBSITE_A_BASE_URL = process.env.WEBSITE_A_BASE_URL || 'https://api.website-a.com';

// Step 1 Proxy: Submit handle to Website A
app.post('/api/submit-handle', async (req, res) => {
  try {
    const { username } = req.body;
    const response = await fetch(`${WEBSITE_A_BASE_URL}/api/submit-handle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal Gateway Error: ' + error.message });
  }
});

// Step 2 Proxy: Verify bio from Website A
app.post('/api/verify-handle', async (req, res) => {
  try {
    const { website_a_id } = req.body;
    const response = await fetch(`${WEBSITE_A_BASE_URL}/api/verify-handle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website_a_id }),
    });

    const data = await response.json();
    
    // Website A jo bhi response degi (including success: false and error), hum exact wahi return karenge
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal Verification Pipeline Error: ' + error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
