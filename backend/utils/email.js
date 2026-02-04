const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Send welcome email to new user
async function sendWelcomeEmail(email, name, organizationName) {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY not configured, skipping email');
    return;
  }

  try {
    await resend.emails.send({
      from: 'AssetFlow <onboarding@resend.dev>',
      to: email,
      subject: `Welcome to AssetFlow - ${organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to AssetFlow! 🎉</h1>
          <p>Hi ${name},</p>
          <p>Your account has been successfully created for <strong>${organizationName}</strong>.</p>
          <p>You can now start managing your assets and tracking maintenance tickets.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The AssetFlow Team</p>
        </div>
      `
    });
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
}

// Send ticket notification to admins
async function sendTicketNotification(organizationId, ticket, asset, user) {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY not configured, skipping email');
    return;
  }

  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Get all admins from the organization
    const admins = await prisma.user.findMany({
      where: {
        organizationId,
        role: 'ADMIN'
      },
      select: { email: true, name: true }
    });

    for (const admin of admins) {
      await resend.emails.send({
        from: 'AssetFlow <notifications@resend.dev>',
        to: admin.email,
        subject: `New Ticket Created - ${asset.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">🔧 New Maintenance Ticket</h2>
            <p>Hi ${admin.name},</p>
            <p>A new ticket has been created by <strong>${user.name}</strong>.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Asset:</strong> ${asset.name}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${asset.location}</p>
              <p style="margin: 5px 0;"><strong>Description:</strong></p>
              <p style="margin: 5px 0; padding: 10px; background-color: white; border-radius: 4px;">${ticket.description}</p>
              <p style="margin: 5px 0;"><strong>Reported by:</strong> ${user.name} (${user.email})</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
            </div>

            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/tickets" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Ticket
              </a>
            </div>

            <p>Please review and assign this ticket as soon as possible.</p>
            <p>Best regards,<br>AssetFlow Notification System</p>
          </div>
        `
      });
    }

    console.log(`✅ Ticket notification sent to ${admins.length} admin(s)`);
  } catch (error) {
    console.error('❌ Failed to send ticket notification:', error);
  }
}

// Send subscription confirmation email
async function sendSubscriptionEmail(email, name, tier, status) {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY not configured, skipping email');
    return;
  }

  try {
    const subject = status === 'active' 
      ? `Subscription Confirmed - ${tier} Plan` 
      : `Subscription ${status} - ${tier} Plan`;

    await resend.emails.send({
      from: 'AssetFlow <billing@resend.dev>',
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Subscription ${status === 'active' ? 'Confirmed' : 'Updated'} ✓</h1>
          <p>Hi ${name},</p>
          <p>Your subscription to the <strong>${tier}</strong> plan has been ${status === 'active' ? 'activated' : status}.</p>
          
          ${status === 'active' ? `
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h3 style="margin-top: 0; color: #166534;">What's included:</h3>
              <ul style="color: #166534;">
                ${tier === 'PRO' ? `
                  <li>Up to 50 assets</li>
                  <li>Unlimited tickets</li>
                  <li>Up to 10 users</li>
                  <li>Advanced analytics</li>
                  <li>Priority support</li>
                ` : `
                  <li>Unlimited assets</li>
                  <li>Unlimited tickets</li>
                  <li>Unlimited users</li>
                  <li>Advanced analytics</li>
                  <li>Dedicated support</li>
                  <li>API access</li>
                `}
              </ul>
            </div>
          ` : ''}

          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/billing" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Manage Subscription
            </a>
          </div>

          <p>Thank you for choosing AssetFlow!</p>
          <p>Best regards,<br>The AssetFlow Team</p>
        </div>
      `
    });
    console.log('✅ Subscription email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send subscription email:', error);
  }
}

module.exports = {
  sendWelcomeEmail,
  sendTicketNotification,
  sendSubscriptionEmail
};
