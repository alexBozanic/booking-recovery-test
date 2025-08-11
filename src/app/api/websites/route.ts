import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { DatabaseService } from '@/lib/database';
import { authOptions } from '../auth/[...nextauth]/route'; // Import authOptions

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions); // Use authOptions
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions); // Use authOptions
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
