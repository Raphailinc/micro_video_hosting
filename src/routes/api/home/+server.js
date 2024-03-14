import db from '../../../database.js';

export async function GET(request) {
  try {
    const rows = await dbAll('SELECT * FROM videos ORDER BY id DESC LIMIT 6');
    const responseBody = JSON.stringify({ videos: rows });
    return new Response(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Ошибка при получении видео из базы данных:', error);
    const errorResponse = JSON.stringify({ error: 'Internal Server Error' });
    return new Response(errorResponse, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

function dbAll(query) {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}