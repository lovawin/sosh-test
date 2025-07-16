const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const childAccountService = require('../../services/childAccount.service');

// Create or update child account profile
router.post('/:platform/profile', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const { motherAccountId, profileData } = req.body;

    const profile = await childAccountService.setProfile(
      req.user.id,
      platform,
      motherAccountId,
      profileData
    );

    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get child account profile
router.get('/:platform/profile', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const { motherAccountId } = req.query;

    const profile = await childAccountService.getProfile(
      req.user.id,
      platform,
      motherAccountId
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all child account profiles for a mother account
router.get('/:platform/mother/:motherAccountId/profiles', auth, async (req, res) => {
  try {
    const { platform, motherAccountId } = req.params;

    // Verify user owns the mother account
    if (req.user.id !== motherAccountId) {
      return res.status(403).json({ message: 'Not authorized to view these profiles' });
    }

    const profiles = await childAccountService.getChildProfiles(motherAccountId, platform);
    res.json(profiles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete child account profile
router.delete('/:platform/profile', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const { motherAccountId } = req.body;

    await childAccountService.deleteProfile(
      req.user.id,
      platform,
      motherAccountId
    );

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
