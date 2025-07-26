import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';

const db = new DatabaseService();

// GET handler to fetch all websites for the logged-in user
export async function GET() {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const websites = await db.getClientsByUserId(user.id);
    return NextResponse.json({ websites }, { status: 200 });

  } catch (error) {
    console.error('Get Websites API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler to create a new website for the logged-in user
export async function POST(request: Request) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, domain } = await request.json();
    if (!name || !domain) {
      return NextResponse.json({ error: 'Name and domain are required' }, { status: 400 });
    }

    const newClient = await db.createClient({
      userId: user.id,
      name,
      domain,
    });

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });

  } catch (error) {
    console.error('Create Website API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
