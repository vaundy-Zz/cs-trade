import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = join(__dirname, '../data');
// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(join(dataDir, 'alerts.db'));


// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS alert_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('price', 'volatility', 'roi')),
    asset TEXT NOT NULL,
    condition TEXT NOT NULL CHECK(condition IN ('above', 'below', 'change')),
    threshold REAL NOT NULL,
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS alert_triggers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id INTEGER NOT NULL,
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    value REAL NOT NULL,
    notified INTEGER DEFAULT 0,
    FOREIGN KEY (alert_id) REFERENCES alert_definitions (id)
  );

  CREATE TABLE IF NOT EXISTS rate_limits (
    alert_id INTEGER NOT NULL,
    last_triggered DATETIME NOT NULL,
    trigger_count INTEGER DEFAULT 1,
    PRIMARY KEY (alert_id)
  );

  CREATE INDEX IF NOT EXISTS idx_alert_user ON alert_definitions(user_id);
  CREATE INDEX IF NOT EXISTS idx_triggers_alert ON alert_triggers(alert_id);
  CREATE INDEX IF NOT EXISTS idx_triggers_notified ON alert_triggers(notified);
`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// SSE clients storage
const sseClients = new Map();

function addSseClient(userId, res) {
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId).add(res);
}

function removeSseClient(userId, res) {
  const clients = sseClients.get(userId);
  if (!clients) {
    return;
  }
  clients.delete(res);
  if (clients.size === 0) {
    sseClients.delete(userId);
  }
}

// Simple auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Simple token format: userId.hash
    const [userId, hash] = token.split('.');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify token (simplified - in production use JWT)
    const expectedHash = crypto.createHash('sha256').update(`${user.id}:${user.password_hash}`).digest('hex').substring(0, 16);
    if (hash !== expectedHash) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper functions
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(user) {
  const hash = crypto.createHash('sha256').update(`${user.id}:${user.password_hash}`).digest('hex').substring(0, 16);
  return `${user.id}.${hash}`;
}

function checkRateLimit(alertId) {
  const now = new Date().toISOString();
  const rateLimit = db.prepare('SELECT * FROM rate_limits WHERE alert_id = ?').get(alertId);
  
  if (!rateLimit) {
    return { allowed: true, reset: false };
  }

  const lastTriggered = new Date(rateLimit.last_triggered);
  const timeDiff = (new Date(now) - lastTriggered) / 1000 / 60; // minutes

  // Rate limit: max 5 triggers per hour
  if (timeDiff < 60 && rateLimit.trigger_count >= 5) {
    return { allowed: false, reset: false };
  }

  // Reset count if more than an hour has passed
  if (timeDiff >= 60) {
    return { allowed: true, reset: true };
  }

  return { allowed: true, reset: false };
}

function updateRateLimit(alertId, reset) {
  const now = new Date().toISOString();
  
  if (reset) {
    db.prepare('INSERT OR REPLACE INTO rate_limits (alert_id, last_triggered, trigger_count) VALUES (?, ?, 1)')
      .run(alertId, now);
  } else {
    db.prepare(`
      INSERT INTO rate_limits (alert_id, last_triggered, trigger_count) 
      VALUES (?, ?, 1)
      ON CONFLICT(alert_id) DO UPDATE SET 
        last_triggered = ?,
        trigger_count = trigger_count + 1
    `).run(alertId, now, now);
  }
}

function checkForDuplicates(alertId, value, timeWindowMinutes = 60) {
  const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString();
  
  const duplicate = db.prepare(`
    SELECT * FROM alert_triggers 
    WHERE alert_id = ? 
      AND value = ? 
      AND triggered_at > ?
    LIMIT 1
  `).get(alertId, value, cutoff);

  return duplicate !== undefined;
}

function broadcastToUser(userId, notification) {
  const clients = sseClients.get(userId);
  if (clients) {
    const message = `data: ${JSON.stringify(notification)}\n\n`;
    for (const client of clients) {
      try {
        client.write(message);
      } catch (error) {
        console.error('Failed to send message to client:', error);
        removeSseClient(userId, client);
      }
    }
  }
}

function sendOutOfBandNotification(alert, notification) {
  const user = db.prepare('SELECT username FROM users WHERE id = ?').get(alert.user_id);
  if (!user) {
    return;
  }

  const summary = `${notification.alertName} for ${notification.asset} (${notification.alertType}) at value ${notification.value}`;
  console.log(`[Notification][Email] ${user.username}: ${summary}`);
  console.log(`[Notification][Push] ${user.username}: ${summary}`);
}

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const passwordHash = hashPassword(password);
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
      .run(username, passwordHash);
    
    const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken({ id: user.id, password_hash: passwordHash });

    res.json({ user, token });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  const userResponse = { id: user.id, username: user.username, created_at: user.created_at };

  res.json({ user: userResponse, token });
});

// Alert definition endpoints
app.get('/api/alerts', authMiddleware, (req, res) => {
  const alerts = db.prepare(`
    SELECT id, name, type, asset, condition, threshold, enabled, created_at, updated_at
    FROM alert_definitions 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `).all(req.user.id);

  res.json(alerts);
});

app.post('/api/alerts', authMiddleware, (req, res) => {
  const { name, type, asset, condition, threshold } = req.body;

  // Validation
  if (!name || name.length < 1 || name.length > 100) {
    return res.status(400).json({ error: 'Name must be between 1 and 100 characters' });
  }

  if (!['price', 'volatility', 'roi'].includes(type)) {
    return res.status(400).json({ error: 'Type must be price, volatility, or roi' });
  }

  if (!asset || asset.length < 1 || asset.length > 20) {
    return res.status(400).json({ error: 'Asset must be between 1 and 20 characters' });
  }

  if (!['above', 'below', 'change'].includes(condition)) {
    return res.status(400).json({ error: 'Condition must be above, below, or change' });
  }

  if (typeof threshold !== 'number' || isNaN(threshold)) {
    return res.status(400).json({ error: 'Threshold must be a valid number' });
  }

  if (threshold < 0 || threshold > 1000000) {
    return res.status(400).json({ error: 'Threshold must be between 0 and 1,000,000' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO alert_definitions (user_id, name, type, asset, condition, threshold) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, name, type, asset, condition, threshold);

    const alert = db.prepare('SELECT * FROM alert_definitions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

app.put('/api/alerts/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, type, asset, condition, threshold, enabled } = req.body;

  const alert = db.prepare('SELECT * FROM alert_definitions WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  // Validation
  if (name !== undefined && (name.length < 1 || name.length > 100)) {
    return res.status(400).json({ error: 'Name must be between 1 and 100 characters' });
  }

  if (type !== undefined && !['price', 'volatility', 'roi'].includes(type)) {
    return res.status(400).json({ error: 'Type must be price, volatility, or roi' });
  }

  if (asset !== undefined && (asset.length < 1 || asset.length > 20)) {
    return res.status(400).json({ error: 'Asset must be between 1 and 20 characters' });
  }

  if (condition !== undefined && !['above', 'below', 'change'].includes(condition)) {
    return res.status(400).json({ error: 'Condition must be above, below, or change' });
  }

  if (threshold !== undefined && (typeof threshold !== 'number' || isNaN(threshold) || threshold < 0 || threshold > 1000000)) {
    return res.status(400).json({ error: 'Threshold must be a valid number between 0 and 1,000,000' });
  }

  if (enabled !== undefined && typeof enabled !== 'boolean' && enabled !== 0 && enabled !== 1) {
    return res.status(400).json({ error: 'Enabled must be a boolean' });
  }

  try {
    const updates = {
      name: name ?? alert.name,
      type: type ?? alert.type,
      asset: asset ?? alert.asset,
      condition: condition ?? alert.condition,
      threshold: threshold ?? alert.threshold,
      enabled: enabled !== undefined ? (enabled ? 1 : 0) : alert.enabled,
      updated_at: new Date().toISOString()
    };

    db.prepare(`
      UPDATE alert_definitions 
      SET name = ?, type = ?, asset = ?, condition = ?, threshold = ?, enabled = ?, updated_at = ?
      WHERE id = ?
    `).run(updates.name, updates.type, updates.asset, updates.condition, updates.threshold, updates.enabled, updates.updated_at, id);

    const updatedAlert = db.prepare('SELECT * FROM alert_definitions WHERE id = ?').get(id);
    res.json(updatedAlert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

app.delete('/api/alerts/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  const alert = db.prepare('SELECT * FROM alert_definitions WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  try {
    db.prepare('DELETE FROM alert_triggers WHERE alert_id = ?').run(id);
    db.prepare('DELETE FROM rate_limits WHERE alert_id = ?').run(id);
    db.prepare('DELETE FROM alert_definitions WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Alert history endpoint
app.get('/api/alerts/:id/history', authMiddleware, (req, res) => {
  const { id } = req.params;

  const alert = db.prepare('SELECT * FROM alert_definitions WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  const triggers = db.prepare(`
    SELECT * FROM alert_triggers 
    WHERE alert_id = ? 
    ORDER BY triggered_at DESC 
    LIMIT 100
  `).all(id);

  res.json(triggers);
});

// SSE endpoint for real-time notifications
app.get('/api/notifications/stream', authMiddleware, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const userId = req.user.id;
  addSseClient(userId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notification stream' })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    removeSseClient(userId, res);
  });
});

// Ingestion endpoint (simulates data ingestion that triggers alert evaluation)
app.post('/api/ingest', express.json(), (req, res) => {
  const { asset, price, volatility, roi } = req.body;

  if (!asset) {
    return res.status(400).json({ error: 'Asset required' });
  }

  try {
    // Evaluate all active alerts for this asset
    const alerts = db.prepare(`
      SELECT * FROM alert_definitions 
      WHERE asset = ? AND enabled = 1
    `).all(asset);

    const triggeredAlerts = [];

    for (const alert of alerts) {
      let rawValue;
      let shouldTrigger = false;

      // Determine value based on alert type
      switch (alert.type) {
        case 'price':
          rawValue = price;
          break;
        case 'volatility':
          rawValue = volatility;
          break;
        case 'roi':
          rawValue = roi;
          break;
      }

      if (rawValue === undefined || rawValue === null) {
        continue;
      }

      const numericValue = Number(rawValue);
      if (Number.isNaN(numericValue)) {
        continue;
      }

      const value = Number(numericValue.toFixed(6));

      // Check condition
      switch (alert.condition) {
        case 'above':
          shouldTrigger = value > alert.threshold;
          break;
        case 'below':
          shouldTrigger = value < alert.threshold;
          break;
        case 'change':
          // For change, check if absolute change exceeds threshold
          const lastTrigger = db.prepare(`
            SELECT value FROM alert_triggers 
            WHERE alert_id = ? 
            ORDER BY triggered_at DESC 
            LIMIT 1
          `).get(alert.id);

          if (lastTrigger && lastTrigger.value !== null) {
            const previousValue = Number(lastTrigger.value);
            if (Number.isNaN(previousValue)) {
              shouldTrigger = true;
            } else {
              const change = Math.abs(value - previousValue);
              shouldTrigger = change >= alert.threshold;
            }
          } else {
            // First time, always trigger
            shouldTrigger = true;
          }
          break;
      }

      if (!shouldTrigger) {
        continue;
      }

      // Check for duplicates
      if (checkForDuplicates(alert.id, value)) {
        continue;
      }

      // Check rate limit
      const rateLimitCheck = checkRateLimit(alert.id);
      if (!rateLimitCheck.allowed) {
        continue;
      }

      // Record trigger
      const result = db.prepare(`
        INSERT INTO alert_triggers (alert_id, value) 
        VALUES (?, ?)
      `).run(alert.id, value);

      // Update rate limit
      updateRateLimit(alert.id, rateLimitCheck.reset);

      const trigger = db.prepare('SELECT * FROM alert_triggers WHERE id = ?').get(result.lastInsertRowid);
      triggeredAlerts.push({ ...trigger, alert });

      // Send real-time notification
      const notification = {
        type: 'alert',
        alertId: alert.id,
        alertName: alert.name,
        asset: alert.asset,
        alertType: alert.type,
        condition: alert.condition,
        threshold: alert.threshold,
        value,
        triggeredAt: trigger.triggered_at
      };

      broadcastToUser(alert.user_id, notification);
      sendOutOfBandNotification(alert, notification);

      // Mark as notified
      db.prepare('UPDATE alert_triggers SET notified = 1 WHERE id = ?').run(result.lastInsertRowid);
    }

    res.json({ 
      processed: alerts.length, 
      triggered: triggeredAlerts.length,
      triggers: triggeredAlerts.map(t => ({
        alertId: t.alert_id,
        alertName: t.alert.name,
        value: t.value
      }))
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).json({ error: 'Ingestion failed' });
  }
});

// Stats endpoint
app.get('/api/stats', authMiddleware, (req, res) => {
  const stats = {
    totalAlerts: db.prepare('SELECT COUNT(*) as count FROM alert_definitions WHERE user_id = ?').get(req.user.id).count,
    activeAlerts: db.prepare('SELECT COUNT(*) as count FROM alert_definitions WHERE user_id = ? AND enabled = 1').get(req.user.id).count,
    totalTriggers: db.prepare(`
      SELECT COUNT(*) as count FROM alert_triggers 
      WHERE alert_id IN (SELECT id FROM alert_definitions WHERE user_id = ?)
    `).get(req.user.id).count,
    recentTriggers: db.prepare(`
      SELECT COUNT(*) as count FROM alert_triggers 
      WHERE alert_id IN (SELECT id FROM alert_definitions WHERE user_id = ?)
        AND triggered_at > datetime('now', '-24 hours')
    `).get(req.user.id).count
  };

  res.json(stats);
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Alerts Workflow server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
