const express = require('express');
const cors = require('cors');
const app = express();

// 1. Core Middlewares mandatory for reading JSON payloads from request body
app.use(cors({ origin: '*' }));
app.use(express.json()); 

// 2. Endpoint for initial username verification request (Step 1)
app.post('/api/submit-handle', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ success: false, message: "Username missing." });
        }
        
        // Website A integration logic via external API or DB mapping
        const generatedToken = "KHR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        const externalId = Date.now().toString(); // Reference ID tracking
        
        return res.json({
            success: true,
            id: externalId,
            verification_string: generatedToken
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 3. Endpoint for final authentication checks (Step 2 Verification)
app.post('/api/verify-handle', async (req, res) => {
    try {
        const { website_a_id } = req.body;
        if (!website_a_id) {
            return res.status(400).json({ success: false, message: "Reference token id missing." });
        }
        
        // Website A logic to fetch and scan YouTube bio logs
        // Responding with status true or verified flag
        return res.json({
            success: true,
            verified: true,
            status: 'verified'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`KHR Backend Server Pipeline active on port ${PORT}`));
module.exports = app;
