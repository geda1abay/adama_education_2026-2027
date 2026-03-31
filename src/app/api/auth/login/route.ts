import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/server/mysql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await loginUser(body.email, body.password, body.role);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
