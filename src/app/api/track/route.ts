import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { EmailService, CampaignService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      trackingId,
      sessionId,
      event,
      formData,
      url,
      timestamp,
      userAgent
    } = body;

    // Validate required fields
    if (!trackingId || !sessionId || !event) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🎯 TRACKING DATA RECEIVED:');
    console.log('Event:', event);
    console.log('Tracking ID:', trackingId);
    console.log('Session ID:', sessionId);
    console.log('Form Data:', formData);
    console.log('URL:', url);
    console.log('---');

    // Get client information
    const client = await DatabaseService.getClientByTrackingId(trackingId);
    if (!client) {
      console.warn(`⚠️ No client found for tracking ID: ${trackingId}`);
      return NextResponse.json(
        { error: 'Invalid tracking ID' },
        { status: 400 }
      );
    }

    // Create booking record
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const bookingData = {
      id: bookingId,
      trackingId,
      sessionId,
      clientId: client.id,
      event,
      formData: formData || {},
      url,
      timestamp: timestamp || new Date().toISOString(),
      userAgent,
      status: event === 'completion' ? 'completed' : 'abandoned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    await DatabaseService.createBooking(bookingData);
    console.log('✅ Booking saved to database:', bookingId);

    // Handle different event types
    if (event === 'abandonment') {
      console.log('🚨 ABANDONMENT DETECTED - Triggering recovery campaign!');
      
      // Check if we have email for recovery
      if (formData.email) {
        const clientInfo = {
          name: client.name,
          domain: client.domain,
          businessType: client.businessType || 'business'
        };

        // Schedule recovery email (15 minutes delay)
        await CampaignService.scheduleRecoveryCampaign(
          bookingId,
          clientInfo,
          formData,
          15 // 15 minutes delay
        );

        console.log(`📧 Recovery campaign scheduled for ${formData.email}`);
      } else {
        console.log('⚠️ No email found in form data - cannot send recovery email');
      }
      
    } else if (event === 'completion') {
      console.log('🎉 BOOKING COMPLETED - Success!');
      
      // NOTE: A proper completion email function would need to be added to email.ts
      // For now, we just log the success.
      if (formData.email) {
        console.log(`✅ Completion email would be sent to ${formData.email}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tracking data received successfully',
      bookingId,
      event
    });

  } catch (error) {
    console.error('❌ Tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle CORS for cross-origin requests from client websites
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
