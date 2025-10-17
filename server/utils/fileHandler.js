import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGIN_ATTEMPTS_FILE = path.join(DATA_DIR, 'loginAttempts.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Initialize data directory and files
export const initializeDataFiles = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(LOGIN_ATTEMPTS_FILE)) {
    fs.writeFileSync(LOGIN_ATTEMPTS_FILE, JSON.stringify({}, null, 2));
  }

  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}, null, 2));
  }
};

// Users
export const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

export const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users:', error);
  }
};

// Login Attempts
export const readLoginAttempts = () => {
  try {
    const data = fs.readFileSync(LOGIN_ATTEMPTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading login attempts:', error);
    return {};
  }
};

export const writeLoginAttempts = (attempts) => {
  try {
    fs.writeFileSync(LOGIN_ATTEMPTS_FILE, JSON.stringify(attempts, null, 2));
  } catch (error) {
    console.error('Error writing login attempts:', error);
  }
};

// Sessions (for Secure Mode)
export const readSessions = () => {
  try {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading sessions:', error);
    return {};
  }
};

export const writeSessions = (sessions) => {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (error) {
    console.error('Error writing sessions:', error);
  }
};

export const addSessionToken = (sessionId, sessionData) => {
  const sessions = readSessions();
  sessions[sessionId] = sessionData;
  writeSessions(sessions);
};

export const validateSessionToken = (sessionId) => {
  const sessions = readSessions();
  return sessions[sessionId] || null;
};

export const removeSessionToken = (sessionId) => {
  const sessions = readSessions();
  delete sessions[sessionId];
  writeSessions(sessions);
};
