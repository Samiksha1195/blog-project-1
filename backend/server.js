const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME
});

async function init() {
  for (let i = 0; i < 20; i++) {           // wait for DB
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS posts(
        id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200), content TEXT,
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      return;
    } catch (e) { await new Promise(r => setTimeout(r, 3000)); }
  }
}
init();

app.get('/api/posts', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM posts ORDER BY id DESC');
  res.json(rows);
});
app.post('/api/posts', async (req, res) => {
  await pool.query('INSERT INTO posts(title,content) VALUES(?,?)',
    [req.body.title, req.body.content]);
  res.json({ ok: true });
});
app.listen(5000, () => console.log('API on 5000'));
