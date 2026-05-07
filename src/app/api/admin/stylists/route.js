import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/stylists.json');

export async function GET() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return Response.json(JSON.parse(data));
  } catch (error) {
    return Response.json({}, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const newSettings = await req.json();
    await fs.writeFile(filePath, JSON.stringify(newSettings, null, 2));
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

