import db from '../../../../../../database.js';

export async function GET(request) {
  const { tag, page, limit } = request.params;

  try {
    const totalCountRows = await dbAll(`
      SELECT COUNT(*) AS total FROM videos 
      JOIN video_tags ON videos.id = video_tags.video_id 
      JOIN tags ON video_tags.tag_id = tags.id 
      WHERE tags.name = ?
    `, [tag]);

    const totalVideos = totalCountRows[0].total;

    const maxPage = Math.ceil(totalVideos / limit);

    const offset = (page - 1) * limit;

    const rows = await dbAll(`
      SELECT videos.* FROM videos 
      JOIN video_tags ON videos.id = video_tags.video_id 
      JOIN tags ON video_tags.tag_id = tags.id 
      WHERE tags.name = ?
      LIMIT ? OFFSET ?
    `, [tag, limit, offset]);
    
    const responseBody = JSON.stringify({ videos: rows, totalVideos });
    const response = new Response(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Ошибка при запросе видео по тегу:', error);
    const errorResponse = JSON.stringify({ error: 'Internal Server Error' });
    const errorResponseObject = new Response(errorResponse, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return errorResponseObject;
  }
}

async function dbAll(query, params) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {  
        resolve(rows);
      }
    });
  });
}