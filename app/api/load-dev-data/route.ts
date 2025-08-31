import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Only work in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
    }

    const dataPath = path.join(process.cwd(), 'dev-user-data.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const devData = JSON.parse(data);

    return NextResponse.json(devData);
  } catch (error) {
    console.error('Error loading dev data:', error);
    return NextResponse.json({ error: 'Failed to load dev data' }, { status: 500 });
  }
}
