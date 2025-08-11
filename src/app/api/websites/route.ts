import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { DatabaseService } from '@/lib/database';
// The handler is the configuration object from our [...nextauth] route
import { handler } from '../auth/[...nextauth]/route';

// GET handler to fetch existing websites for the logged-in user
export async function GET(request: NextRequest) {
  // Use NextAuth to get the session
  const session = await getServerSession(handler);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const db = new DatabaseService();
    const websites = await db.getClientsByUserId(userId);
    return NextResponse.json(websites);
  } catch (error) {
    console.error('Get Websites API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}

// POST handler to create a new website
export async function POST(request: NextRequest) {
  const session = await getServerSession(handler);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { name, domain } = await request.json();
    if (!name || !domain) {
      return NextResponse.json({ error: 'Website name and domain are required' }, { status: 400 });
    }

    const db = new DatabaseService();
    const newClient = await db.createClient({ userId, name, domain });
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Create Website API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
