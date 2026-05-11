import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/services.json');

export async function GET() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return Response.json({ services: JSON.parse(data) });
  } catch (error) {
    return Response.json({ services: [] });
  }
}

export async function POST(req) {
  try {
    const services = await req.json();
    await fs.writeFile(filePath, JSON.stringify(services, null, 2));
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
