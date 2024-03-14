import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Ошибка при открытии базы данных', err.message);
  } else {
    console.log('Подключение к базе данных успешно установлено');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    video_file TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS video_tags (
    video_id INTEGER,
    tag_id INTEGER,
    FOREIGN KEY(video_id) REFERENCES videos(id),
    FOREIGN KEY(tag_id) REFERENCES tags(id)
  )`);
});

export default db;