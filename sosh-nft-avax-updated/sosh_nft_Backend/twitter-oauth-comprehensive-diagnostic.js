/**
 * Twitter OAuth Comprehensive Diagnostic Script
 * 
 * This script adds comprehensive logging to diagnose the exact cause of the Twitter OAuth session issue.
 * It will:
 * 1. Add middleware to log session state at each step of the OAuth flow
 * 2. Track session IDs and cookies to identify session mismatches
 * 3. Log detailed information about the request and response at each step
 * 4. Ensure all errors are properly logged to MongoDB
 */

const express = require('express');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const expresssession = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const mongoose = require('mongoose');
const appconfig = require('./config/appconfig');
const axios = require('axios');
const uuid = require('uuid').v4;
const oauthSignature = require('oauth-signature');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'diagnostic-logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a log file stream
const logStream = fs.createWriteStream(path.join(logsDir, 'twitter-oauth-diagnostic.log'), { flags: 'a' });

// Helper function to log to both console and file
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage);
  logStream.write(logMessage + '\n');
  
  if (data) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    console.log(dataString);
    logStream.write(dataString + '\n');
  }
  
  logStream.write('\n');
}

// Create Express app
const app = express();

// Add cookie parser
app.use(cookieParser());

// Log all requests
app.use((req, res, next) => {
  log(`Request: ${req.method} ${req.url}`, {
    headers: req.headers,
    cookies: req.cookies,
    query: req.query,
    body: req.body
  });
  next();
});

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

