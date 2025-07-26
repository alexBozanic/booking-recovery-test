import { Resend } from 'resend';
import { DatabaseService } from './database';
import { BookingData, ClientInfo } from '@/app/types';

const resend = new Resend(process.env.RESEND_API_KEY);
const db = new DatabaseService();

export class EmailService {

  // This is the primary method called by the tracking API
  async startAbandonmentCampaign(userId: string, clientInfo: ClientInfo, bookingData: BookingData) {
    try {
      const campaign = await db.getCampaignByUserId(userId);

      // Use default campaign settings if none are saved
      const subject = campaign?.subject ?? 'You left something behind!';
      const body = campaign?.body ?? 'You were so close to finishing your booking. Complete it now!';
      const delayMinutes = campaign?.delayMinutes ?? 60;
      const isActive = campaign?.isActive ?? true;

      if (!isActive) {
        console.log(`Campaign for user ${userId} is inactive. No email will be sent.`);
        return;
      }

      if (!bookingData.email) {
        console.log('No email address found in booking data. Cannot send recovery email.');
        return;
      }

      console.log(`Scheduling email for ${bookingData.email} in ${delayMinutes} minutes.`);

      // In a real scenario, you would use a job scheduler (e.g., Vercel Cron Jobs, AWS Lambda)
      // For now, we'll simulate the delay with setTimeout.
      // IMPORTANT: This will not work reliably in a serverless environment for long delays.
      setTimeout(() => {
        this.sendAbandonmentEmail(bookingData.email, clientInfo, bookingData, subject, body)
          .catch(console.error);
      }, delayMinutes * 60 * 1000); // Convert minutes to milliseconds

    } catch (error) {
      console.error('Error starting abandonment campaign:', error);
    }
  }

  // This method sends the actual email
  private async sendAbandonmentEmail(
    to: string,
    clientInfo: ClientInfo,
    bookingData: BookingData,
    subject: string,
    body: string
  ) {
    const from = 'onboarding@resend.dev'; // Replace with your verified Resend domain

    // Simple personalization
    const personalizedBody = body
      .replace('{{name}}', bookingData.name || 'there')
      .replace('{{email}}', bookingData.email);

    try {
      const data = await resend.emails.send({
        from: from,
        to: [to],
        subject: subject,
        html: `<p>${personalizedBody}</p>`, // Using a simple HTML structure
      });

      console.log('Recovery email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending recovery email:', error);
      throw error;
    }
  }
}
