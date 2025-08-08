import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// Helper to get user ID from the Authorization header
function getUserIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    // CORRECTED: Add a check to ensure 'decoded' is not null before accessing '.id'
    if (decoded && typeof decoded === 'object' && 'id' in decoded) {
      return decoded.id;
    }
    return null;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

// GET handler to fetch existing websites for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, domain } = await request.json();

    if (!name || !domain) {
      return NextResponse.json({ error: 'Website name and domain are required' }, { status: 400 });
    }

    const db = new DatabaseService();
    const newClient = await db.createClient({
      userId,
      name,
      domain,
    });

    return NextResponse.json(newClient, { status: 201 });

  } catch (error)
    console.error('Create Website API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
