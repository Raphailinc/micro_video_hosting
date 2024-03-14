import db from './database.js';

export async function isDatabaseEmpty() {
  try {
    const rows = await db.all('SELECT * FROM videos');
    return rows.length === 0;
  } catch (error) {
    console.error('Ошибка при проверке базы данных:', error);
    return true;
  }
}

isDatabaseEmpty()
  .then(isEmpty => {
    if (isEmpty) {
      console.log('База данных пуста.');
    } else {
      console.log('База данных не пуста.');
    }
  });