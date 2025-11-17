const express = require('express');
const axios = require('axios');
const Creator = require('../models/Creator');
const router = express.Router();

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;

// Step 1: Redirect to Instagram OAuth
router.get('/', (req, res) => {
  const { creatorId } = req.query;
  console.log('--- Instagram OAuth Start ---');
  console.log('creatorId:', creatorId);
  console.log('INSTAGRAM_CLIENT_ID:', INSTAGRAM_CLIENT_ID);
  console.log('INSTAGRAM_REDIRECT_URI:', INSTAGRAM_REDIRECT_URI);
  if (!creatorId) return res.status(400).send('Missing creatorId');
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(INSTAGRAM_REDIRECT_URI)}&scope=user_profile,user_media&response_type=code&state=${creatorId}`;
  console.log('Redirecting to:', authUrl);
  res.redirect(authUrl);
});

// Step 2: Handle callback and exchange code for token
router.get('/callback', async (req, res) => {
  const { code, state } = req.query; // state = creatorId
  console.log('--- Instagram OAuth Callback ---');
  console.log('code:', code);
  console.log('state (creatorId):', state);
  if (!code || !state) return res.status(400).send('Missing code or state');
  try {
    // Exchange code for access token
    console.log('Exchanging code for access token...');
    const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token', null, {
      params: {
        client_id: INSTAGRAM_CLIENT_ID,
        client_secret: INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: INSTAGRAM_REDIRECT_URI,
        code,
      },
    });
    const { access_token, user_id } = tokenRes.data;
    console.log('Access token:', access_token);
    console.log('Instagram user_id:', user_id);

    // Save token to creator
    await Creator.findByIdAndUpdate(state, {
      instagramAccessToken: access_token,
      instagramUserId: user_id,
    });

    res.send('Instagram account connected! You can close this window.');
  } catch (err) {
    console.error('Instagram OAuth error:', err.response?.data || err.message);
    res.status(400).send('Instagram OAuth failed: ' + (err.response?.data?.error_message || err.message));
  }
});

module.exports = router;
