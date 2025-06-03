const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database setup
const db = new sqlite3.Database('./database.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS festivals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    address TEXT,
    latitude REAL,
    longitude REAL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    region TEXT NOT NULL,
    image_url TEXT,
    website TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create default admin user
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, password) VALUES ('admin', ?)`, [defaultPassword]);
});

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '24h' });

    res.json({ token });
  });
});

// Festival routes
app.get('/api/festivals', (req, res) => {
  const { region } = req.query;
  let query = 'SELECT * FROM festivals WHERE 1=1';
  const params = [];

  if (region && region !== 'all') {
    query += ' AND region = ?';
    params.push(region);
  }

  query += ' ORDER BY start_date ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/festivals/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM festivals WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Festival not found' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/festivals', authenticateToken, upload.single('image'), (req, res) => {
  const {
    name, description, location, address, latitude, longitude,
    start_date, end_date, region, website, contact_email, contact_phone
  } = req.body;

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `INSERT INTO festivals 
    (name, description, location, address, latitude, longitude, start_date, end_date, region, image_url, website, contact_email, contact_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(query, [name, description, location, address, latitude, longitude, start_date, end_date, region, image_url, website, contact_email, contact_phone], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/festivals/:id', authenticateToken, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const {
    name, description, location, address, latitude, longitude,
    start_date, end_date, region, website, contact_email, contact_phone
  } = req.body;

  let image_url = req.body.existing_image;
  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  const query = `UPDATE festivals SET 
    name = ?, description = ?, location = ?, address = ?, latitude = ?, longitude = ?,
    start_date = ?, end_date = ?, region = ?, image_url = ?, website = ?, contact_email = ?, contact_phone = ?
    WHERE id = ?`;

  db.run(query, [name, description, location, address, latitude, longitude, start_date, end_date, region, image_url, website, contact_email, contact_phone, id], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

app.delete('/api/festivals/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM festivals WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Create uploads directory
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
