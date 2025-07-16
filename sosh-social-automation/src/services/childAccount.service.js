const ChildAccountProfile = require('../models/ChildAccountProfile');

class ChildAccountService {
  /**
   * Create or update a child account's personality profile
   */
  async setProfile(userId, platform, motherAccountId, profileData) {
    try {
      const profile = await ChildAccountProfile.findOneAndUpdate(
        { userId, platform, motherAccountId },
        profileData,
        { new: true, upsert: true }
      );
      return profile;
    } catch (error) {
      throw new Error(`Failed to set child account profile: ${error.message}`);
    }
  }

  /**
   * Get a child account's personality profile
   */
  async getProfile(userId, platform, motherAccountId) {
    try {
      const profile = await ChildAccountProfile.findOne({
        userId,
        platform,
        motherAccountId
      });
      return profile;
    } catch (error) {
      throw new Error(`Failed to get child account profile: ${error.message}`);
    }
  }

  /**
   * Determine if and how a child account should engage with content
   */
  async determineEngagement(userId, platform, motherAccountId, contentType) {
    try {
      const profile = await this.getProfile(userId, platform, motherAccountId);
      if (!profile) {
        return { shouldEngage: false };
      }

      const shouldEngage = profile.shouldEngageWith(contentType);
      if (!shouldEngage) {
        return { shouldEngage: false };
      }

      return {
        shouldEngage: true,
        engagementStyle: profile.engagementStyle,
        personality: profile.personality,
        relationshipToMother: profile.relationshipToMother
      };
    } catch (error) {
      throw new Error(`Failed to determine engagement: ${error.message}`);
    }
  }

  /**
   * Get all child accounts' profiles for a mother account
   */
  async getChildProfiles(motherAccountId, platform) {
    try {
      const profiles = await ChildAccountProfile.find({
        motherAccountId,
        platform
      }).populate('userId', 'name');
      return profiles;
    } catch (error) {
      throw new Error(`Failed to get child account profiles: ${error.message}`);
    }
  }

  /**
   * Delete a child account's personality profile
   */
  async deleteProfile(userId, platform, motherAccountId) {
    try {
      await ChildAccountProfile.findOneAndDelete({
        userId,
        platform,
        motherAccountId
      });
    } catch (error) {
      throw new Error(`Failed to delete child account profile: ${error.message}`);
    }
  }
}

module.exports = new ChildAccountService();
