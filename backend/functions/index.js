/**
 * Cloud Functions Entry Point
 * 
 * Export all Cloud Functions here
 */

const { extractDealFromImage } = require('./extractDealFromImage');

module.exports = {
  extractDealFromImage,
};

