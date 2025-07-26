import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

const db = new DatabaseService();

// GET handler to fetch the current campaign for a user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
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
      return NextResponse.json({ 
        campaign: {
          subject: 'Still thinking about it?',
          body: 'We noticed you left something in your booking. Complete your reservation now!',
          delayMinutes: 60,
          isActive: true
        } 
      }, { status: 200 });
    }

    return NextResponse.json({ campaign }, { status: 200 });

  } catch (error) {
    console.error('Get Campaign API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler to create or update a campaign for a user
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { subject, body, delayMinutes, isActive } = await request.json();
    if (subject === undefined || body === undefined || delayMinutes === undefined) {
        return NextResponse.json({ error: 'Missing required campaign fields' }, { status: 400 });
    }

    const campaignData = {
      userId: user.id,
      subject,
      body,
      delayMinutes,
      isActive: isActive !== undefined ? isActive : true,
    };

    const savedCampaign = await db.createOrUpdateCampaign(campaignData);
    return NextResponse.json({ success: true, campaign: savedCampaign }, { status: 200 });

  } catch (error) {
    console.error('Save Campaign API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
