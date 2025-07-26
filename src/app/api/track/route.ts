import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database'; // Corrected import
import { EmailService } from '@/lib/email';

const db = new DatabaseService(); // Corrected instantiation
const emailService = new EmailService();

export async function POST(request: NextRequest) {
  try {
    const { trackingId, bookingData, clientInfo } = await request.json();

    if (!trackingId || !bookingData || !clientInfo) {
      return NextResponse.json({ error: 'Missing required tracking data' }, { status: 400 });
    }

    // First, verify the trackingId corresponds to a real client (website)
    const client = await db.getClientById(trackingId);
    if (!client) {
      return NextResponse.json({ error: 'Invalid tracking ID' }, { status: 403 });
    }

    // The client is valid, so we can save the abandoned booking
    const savedBooking = await db.createAbandonedBooking({
      clientId: trackingId,
      userId: client.userId, // We need the userId for partitioning
      bookingData,
      clientInfo,
      status: 'abandoned',
      timestamp: new Date().toISOString(),
    });

    // Now, trigger the email campaign for this user
    await emailService.startAbandonmentCampaign(client.userId, clientInfo, bookingData);

    return NextResponse.json({ success: true, bookingId: savedBooking.id }, { status: 200 });

  } catch (error) {
    console.error('Tracking API error:', error);
    // Do not send detailed errors back to the client for security reasons
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}

// OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
