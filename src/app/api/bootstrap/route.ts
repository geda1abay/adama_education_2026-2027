import { NextResponse } from 'next/server';
import { getSnapshot } from '@/server/mysql';

export async function GET() {
  try {
    const snapshot = await getSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load MySQL data.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
