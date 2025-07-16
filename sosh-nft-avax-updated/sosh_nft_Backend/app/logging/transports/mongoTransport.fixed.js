/**
 * MongoDB Transport for Winston
 *
 * @description Custom Winston transport that writes logs directly to MongoDB
 */

const Transport = require('winston-transport');
const dbConnection = require('../../services/dbConnection');

// Use console.log for internal logging to avoid circular dependencies
