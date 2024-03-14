import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../../static/.env') });

export async function load({ params }) {
  const { tag } = params;
  return {
    props: {
      tag,
      BASE_URL: process.env.BASE_URL
    }
  };
}