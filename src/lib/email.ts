import { Resend } from 'resend';
import { DatabaseService } from './database';
import { BookingData, ClientInfo } from '../types'; // CORRECTED PATH

const resend = new Resend(process.env.RESEND_API_KEY);
const db = new DatabaseService();

export class EmailService {
  async startAbandonmentCampaign(userId: string, clientInfo: ClientInfo, bookingData: BookingData) {
    try {
      const campaign = await db.getCampaignByUserId(userId);
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
      setTimeout(() => {
        this.sendAbandonmentEmail(bookingData.email, clientInfo, bookingData, subject, body)
          .catch(console.error);
      }, delayMinutes * 60 * 1000);
    } catch (error) {
      console.error('Error starting abandonment campaign:', error);
    }
  }

  private async sendAbandonmentEmail(
    to: string,
    clientInfo: ClientInfo,
    bookingData: BookingData,
    subject: string,
    body: string
  ) {
    const from = 'onboarding@resend.dev';
    const personalizedBody = body
      .replace('{{name}}', bookingData.name || 'there')
      .replace('{{email}}', bookingData.email);
    try {
      const data = await resend.emails.send({
        from: from,
        to: [to],
        subject: subject,
        html: `<p>${personalizedBody}</p>`,
      });
      console.log('Recovery email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending recovery email:', error);
      throw error;
    }
  }
}
