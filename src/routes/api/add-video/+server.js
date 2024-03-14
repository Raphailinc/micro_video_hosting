import db from '../../../database.js';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.request.formData();

    if (!formData) {
      throw new Error('Данные формы не были предоставлены.');
    }

    const title = formData.get('title');
    const description = formData.get('description');
    const tags = formData.getAll('tags[]');
    const videoFile = formData.get('video_file');

    if (!videoFile) {
      throw new Error('Видеофайл не был загружен.');
    }

    const uploadDir = path.relative(process.cwd(), 'static/videos');
    await fs.mkdir(uploadDir, { recursive: true });
    const newFileName = `${Date.now()}_${videoFile.name}`;
    const filePath = path.join(uploadDir, newFileName);

    const buffer = Buffer.from(await videoFile.arrayBuffer());

    await fs.writeFile(filePath, buffer);

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO videos (title, description, video_file) VALUES (?, ?, ?)`,
        [title, description, newFileName],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this);
          }
        }
      );
    });

    if (result) {
      const videoId = result.lastID;

      for (const tag of tags) {
        const tagId = await getTagId(tag);
        await addVideoTag(videoId, tagId);
      }
    } else {
      console.error('Не удалось получить videoId');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при обработке POST запроса:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}

async function getTagId(tag) {
  const existingTag = await dbAll('SELECT id FROM tags WHERE name = ?', [tag]);
  if (existingTag.length > 0) {
    console.log(`Идентификатор для тега '${tag}': ${existingTag[0].id}`);
    return existingTag[0].id;
  } else {
    console.log(`Тег '${tag}' не найден`);
    return null;
  }
}

async function addVideoTag(videoId, tagId) {
  await new Promise((resolve, reject) => {
    db.run('INSERT INTO video_tags (video_id, tag_id) VALUES (?, ?)', [videoId, tagId], function(err) {
      if (err) {
        reject(err);
      } else {
        console.log(`Связь между видео ${videoId} и тегом ${tagId} успешно добавлена`);
        resolve();
      }
    });
  });
}

export async function GET(request) {
  try {
    const rows = await dbAll('SELECT name FROM tags');
    const tags = rows.map(row => row.name.trim());
    return new Response(JSON.stringify({ tags }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Ошибка при запросе тегов:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

function dbAll(query, params) {
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