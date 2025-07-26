import { NextResponse } from 'next/server';
import { Database } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

const db = new Database();

// GET handler to fetch the current campaign for a user
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

    const campaign = await db.getCampaignByUserId(user.id);

    if (!campaign) {
      return NextResponse.json({ campaign: null }, { status: 200 });
    }

    return NextResponse.json({ campaign }, { status: 200 });

  } catch (error) {
    console.error('Get Campaign API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// POST handler to create or update a campaign for a user
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

    const { subject, body, delayMinutes, isActive } = await request.json();

    if (!subject || !body || !delayMinutes) {
        return NextResponse.json({ error: 'Missing required campaign fields' }, { status: 400 });
    }

    const campaignData = {
      userId: user.id,
      subject,
      body,
      delayMinutes,
      isActive: isActive !== undefined ? isActive : true, // Default to active
    };

    const savedCampaign = await db.createOrUpdateCampaign(campaignData);

    return NextResponse.json({ success: true, campaign: savedCampaign }, { status: 200 });

  } catch (error) {
    console.error('Save Campaign API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
