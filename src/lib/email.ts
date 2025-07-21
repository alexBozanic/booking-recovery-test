import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface BookingData {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  service?: string;
  [key: string]: any;
}

export interface ClientInfo {
  name: string;
  domain: string;
  businessType?: string;
}

export class EmailService {
  // Default email templates
  static getDefaultTemplate(clientInfo: ClientInfo, bookingData: BookingData): EmailTemplate {
    const customerName = bookingData.name || 'there';
    const businessName = clientInfo.name;
    const appointmentDetails = this.formatAppointmentDetails(bookingData);
    
    return {
      subject: `Complete Your ${businessName} Booking`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Complete Your Booking</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Don't Miss Your Appointment!</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              
              <p>We noticed you started booking an appointment with <strong>${businessName}</strong> but didn't complete it. We'd love to help you finish your booking!</p>
              
              ${appointmentDetails ? `
                <div class="details">
                  <h3>Your Booking Details:</h3>
                  ${appointmentDetails}
                </div>
              ` : ''}
              
              <p>Complete your booking now to secure your preferred time slot:</p>
              
              <a href="https://${clientInfo.domain}" class="button">Complete My Booking</a>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>
              The ${businessName} Team</p>
            </div>
            <div class="footer">
              <p>This email was sent because you started a booking process on our website.</p>
              <p>If you no longer wish to receive these emails, please contact us directly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${customerName},

We noticed you started booking an appointment with ${businessName} but didn't complete it. We'd love to help you finish your booking!

${appointmentDetails ? `Your Booking Details:\n${this.formatAppointmentDetailsText(bookingData )}\n` : ''}

Complete your booking now: https://${clientInfo.domain}

If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
The ${businessName} Team

---
This email was sent because you started a booking process on our website.
If you no longer wish to receive these emails, please contact us directly.
      `
    };
  }

  // Format appointment details for HTML
  static formatAppointmentDetails(bookingData: BookingData ): string {
    const details = [];
    
    if (bookingData.date) {
      details.push(`<p><strong>Date:</strong> ${bookingData.date}</p>`);
    }
    if (bookingData.time) {
      details.push(`<p><strong>Time:</strong> ${bookingData.time}</p>`);
    }
    if (bookingData.service) {
      details.push(`<p><strong>Service:</strong> ${bookingData.service}</p>`);
    }
    if (bookingData.phone) {
      details.push(`<p><strong>Phone:</strong> ${bookingData.phone}</p>`);
    }
    
    return details.join('');
  }

  // Format appointment details for plain text
  static formatAppointmentDetailsText(bookingData: BookingData): string {
    const details = [];
    
    if (bookingData.date) details.push(`Date: ${bookingData.date}`);
    if (bookingData.time) details.push(`Time: ${bookingData.time}`);
    if (bookingData.service) details.push(`Service: ${bookingData.service}`);
    if (bookingData.phone) details.push(`Phone: ${bookingData.phone}`);
    
    return details.join('\n');
  }

  // Send abandonment recovery email
  static async sendAbandonmentEmail(
    toEmail: string,
    clientInfo: ClientInfo,
    bookingData: BookingData,
    customTemplate?: EmailTemplate
  ) {
    try {
      const template = customTemplate || this.getDefaultTemplate(clientInfo, bookingData);
      const fromEmail = process.env.FROM_EMAIL || 'noreply@bookingrecovery.com';
      
      console.log(`📧 Sending abandonment email to ${toEmail} for ${clientInfo.name}`);
      
      const result = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`✅ Email sent successfully:`, result);
      return { success: true, messageId: result.data?.id };
      
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${toEmail}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Send follow-up email (for multiple recovery attempts)
  static async sendFollowUpEmail(
    toEmail: string,
    clientInfo: ClientInfo,
    bookingData: BookingData,
    attemptNumber: number = 2
  ) {
    const customerName = bookingData.name || 'there';
    const businessName = clientInfo.name;
    
    // This line silences the "unused variable" error for now.
    if (attemptNumber) console.log(`Sending follow-up attempt #${attemptNumber}`);

    const template: EmailTemplate = {
      subject: `Last Chance: Your ${businessName} Appointment`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Last Chance - Complete Your Booking</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .urgency { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Last Chance!</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              
              <div class="urgency">
                <p><strong>Your preferred time slot may be taken soon!</strong></p>
              </div>
              
              <p>This is our final reminder about your incomplete booking with <strong>${businessName}</strong>. We want to make sure you don't miss out on your appointment.</p>
              
              <p>Popular time slots fill up quickly, so we recommend completing your booking as soon as possible.</p>
              
              <a href="https://${clientInfo.domain}" class="button">Secure My Appointment Now</a>
              
              <p>If you're no longer interested, no worries! Just ignore this email and we won't contact you again about this booking.</p>
              
              <p>Thank you,<br>
              The ${businessName} Team</p>
            </div>
            <div class="footer">
              <p>This is our final reminder about your incomplete booking.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${customerName},

⏰ LAST CHANCE! Your preferred time slot may be taken soon!

This is our final reminder about your incomplete booking with ${businessName}. We want to make sure you don't miss out on your appointment.

Popular time slots fill up quickly, so we recommend completing your booking as soon as possible.

Secure your appointment now: https://${clientInfo.domain}

If you're no longer interested, no worries! Just ignore this email and we won't contact you again about this booking.

Thank you,
The ${businessName} Team

---
This is our final reminder about your incomplete booking.
      `
    };

    return this.sendAbandonmentEmail(toEmail, clientInfo, bookingData, template );
  }

  // Test email configuration
  static async testEmailConfiguration() {
    try {
      const testEmail = process.env.FROM_EMAIL || 'test@example.com';
      
      const result = await resend.emails.send({
        from: testEmail,
        to: testEmail,
        subject: 'Booking Recovery Tool - Email Test',
        html: '<h1>Email Configuration Test</h1><p>If you receive this email, your email service is configured correctly!</p>',
        text: 'Email Configuration Test\n\nIf you receive this email, your email service is configured correctly!',
      });

      console.log('✅ Email test successful:', result);
      return { success: true, result };
      
    } catch (error: any) {
      console.error('❌ Email test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Basic campaign service to schedule emails
export class CampaignService {
  static async scheduleRecoveryCampaign(
    bookingId: string,
    clientInfo: ClientInfo,
    bookingData: BookingData,
    delayMinutes: number
  ) {
    console.log(
      `Scheduling recovery email for booking ${bookingId} in ${delayMinutes} minutes.`
    );
    
    // In a real scenario, this would use a job scheduler like BullMQ or a serverless function with a delay.
    // For now, we'll simulate the delay and send the email directly.
    // IMPORTANT: This setTimeout will not work reliably in a serverless environment.
    // This is a placeholder for a proper background job system.
    
    setTimeout(() => {
      if (bookingData.email) {
        EmailService.sendAbandonmentEmail(
          bookingData.email,
          clientInfo,
          bookingData
        ).catch(console.error);
      }
    }, delayMinutes * 60 * 1000); // Convert minutes to milliseconds

    return Promise.resolve();
  }
}
