const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// FREECLIPPING.COM API CONFIG
// ==========================================
const FC_BASE = 'https://app.freeclipping.com/api';
const FC_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjE0MywiZW1haWwiOiJhZm5hbnR2MDAxMUBnbWFpbC5jb20iLCJ1c2VyX3R5cGUiOiJDbGlwcGVyIiwiaWF0IjoxNzgwMzExNTAxLCJleHAiOjE3ODA5MTYzMDF9.2pshjlwdk1rCFPiWezneSfWboAsRlnMREFUXCFEWerA';

const FC_HEADERS = {
  accept: '*/*',
  'accept-language': 'en-US,en;q=0.9',
  authorization: `Bearer ${FC_TOKEN}`,
  'content-type': 'application/json',
};

// ==========================================
// ROUTE 1: Submit YouTube Handle
// Frontend calls: POST /api/submit-handle
// Forwards to:    POST https://app.freeclipping.com/api/user/socials
// Returns: { id, verification_string, ... }
// ==========================================
app.post('/api/submit-handle', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'username is required' });
    }

    console.log(`[submit-handle] Submitting handle: ${username}`);

    const response = await fetch(`${FC_BASE}/user/socials`, {
      method: 'POST',
      headers: FC_HEADERS,
      body: JSON.stringify({ platform: 'YouTube', username }),
    });

    const data = await response.json();
    console.log(`[submit-handle] FC Response (${response.status}):`, data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || 'freeclipping.com request failed',
        fc_response: data,
      });
    }

    // Normalize: ensure id and verification_string are at top level
    const normalized = {
      id: data.id ?? data.data?.id ?? null,
      verification_string:
        data.verification_string ??
        data.verificationString ??
        data.code ??
        data.verification_code ??
        data.data?.verification_string ??
        data.data?.code ??
        null,
      platform: data.platform ?? 'YouTube',
      username: data.username ?? username,
      raw: data,
    };

    console.log(`[submit-handle] Normalized:`, normalized);
    return res.json(normalized);
  } catch (err) {
    console.error('[submit-handle] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTE 2: Verify YouTube Handle
// Frontend calls: POST /api/verify-handle  { website_a_id: "9097" }
// Forwards to:    POST https://app.freeclipping.com/api/user/socials/9097/verify
// Returns: freeclipping verification result
// ==========================================
app.post('/api/verify-handle', async (req, res) => {
  try {
    const { website_a_id } = req.body;

    if (!website_a_id) {
      return res.status(400).json({ error: 'website_a_id is required' });
    }

    console.log(`[verify-handle] Verifying social ID: ${website_a_id}`);

    const response = await fetch(
      `${FC_BASE}/user/socials/${website_a_id}/verify`,
      {
        method: 'POST',
        headers: {
          ...FC_HEADERS,
          'content-length': '0',
        },
      }
    );

    const rawText = await response.text();
    console.log(
      `[verify-handle] FC Response (${response.status}): ${rawText}`
    );

    // Parse JSON safely
    let data = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw_text: rawText };
    }

    // If freeclipping returns non-2xx, verification failed
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        verified: false,
        message: data?.message || `Verification failed (HTTP ${response.status})`,
        fc_response: data,
      });
    }

    // Normalize success response
    const normalized = {
      success: true,
      verified: true,
      message: data?.message || 'Channel verified successfully',
      fc_response: data,
    };

    console.log(`[verify-handle] Normalized:`, normalized);
    return res.json(normalized);
  } catch (err) {
    console.error('[verify-handle] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
  res.json({ status: 'KHR Backend Online', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ KHR Backend running on port ${PORT}`);
});
