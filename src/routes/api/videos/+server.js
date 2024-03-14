import db from '../../../database.js';

export async function GET(request) {
    try {
        const videos = await getAllVideosWithTags();
        return new Response(JSON.stringify(videos), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching videos from database:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

async function getAllVideosWithTags() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT videos.*, GROUP_CONCAT(tags.name) AS tags
             FROM videos
             LEFT JOIN video_tags ON videos.id = video_tags.video_id
             LEFT JOIN tags ON video_tags.tag_id = tags.id
             GROUP BY videos.id`,
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });
}