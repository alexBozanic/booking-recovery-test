import { NextRequest, NextResponse } from 'next/server';
// import { getSession } from '@/lib/session'; // REMOVED THIS BROKEN IMPORT
import { DatabaseService } from '@/lib/database';

// export async function GET(request: NextRequest) {
//   const session = await getSession(request);
//   if (!session?.user) {
//     return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//   }
//
//   const { user } = session;
//   const db = new DatabaseService();
//
//   try {
//     const campaign = await db.getCampaignByUserId(user.id);
//     if (!campaign) {
//       return NextResponse.json({
//         campaign: {
//           emailSubject: '',
//           emailBody: '',
//           fromName: '',
//           fromEmail: '',
//         },
//       });
//     }
//     return NextResponse.json({ campaign });
//   } catch (error) {
//     console.error('Failed to retrieve campaign:', error);
//     return NextResponse.json({ error: 'Failed to retrieve campaign' }, { status: 500 });
//   }
// }

// export async function POST(request: NextRequest) {
//   const session = await getSession(request);
//   if (!session?.user) {
//     return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//   }
//
//   const { user } = session;
//   const db = new DatabaseService();
//   const campaignData = await request.json();
//
//   try {
//     const newCampaign = await db.createCampaign({
//       ...campaignData,
//       userId: user.id,
//     });
//     return NextResponse.json({ campaign: newCampaign }, { status: 201 });
//   } catch (error) {
//     console.error('Failed to create campaign:', error);
//     return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
//   }
// }
