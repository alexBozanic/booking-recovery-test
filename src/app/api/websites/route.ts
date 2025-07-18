import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's websites
    const websites = await DatabaseService.getClientsByUserId(decoded.userId);
    
    return NextResponse.json({
      success: true,
      websites
    });

  } catch (error) {
    console.error('Get websites API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { name, domain, businessType } = await request.json();

    // Validate input
    if (!name || !domain) {
      return NextResponse.json(
        { error: 'Name and domain are required' },
        { status: 400 }
      );
    }

    // Generate unique tracking ID
    const trackingId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create client record
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clientData = {
      id: clientId,
      userId: decoded.userId,
      name,
      domain: domain.replace(/^https?:\/\//, '' ), // Remove protocol if present
      trackingId,
      businessType: businessType || 'general',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    await DatabaseService.createClient(clientData);

    console.log(`✅ New website created: ${name} (${trackingId})`);

    return NextResponse.json({
      success: true,
      message: 'Website added successfully',
      website: clientData
    });

  } catch (error) {
    console.error('Add website API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
