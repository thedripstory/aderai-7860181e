import * as React from "npm:react@18.3.1";

interface TestUserInvitationEmailProps {
  firstName: string;
  brandName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
  dashboardUrl: string;
}

export const TestUserInvitationEmail = ({
  firstName,
  brandName,
  email,
  tempPassword,
  loginUrl,
}: TestUserInvitationEmailProps): string => {
  // Return raw HTML string to avoid React rendering issues
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Aderai Beta</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #FFF8F3;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #FFE8D9; border-radius: 8px;">
    <tr>
      <td style="padding: 40px 20px;">
        <!-- Logo -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/zoomed-inblack-logo-png%20copy.png" width="120" alt="Aderai" style="display: block;">
            </td>
          </tr>
        </table>

        <!-- Header -->
        <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 700; margin: 30px 0 20px; text-align: center;">
          Welcome to Aderai Beta! 🎉
        </h1>

        <p style="color: #374151; font-size: 16px; line-height: 26px; margin: 16px 0;">
          Hi ${firstName},
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 26px; margin: 16px 0;">
          Great news! You've been selected to be one of our exclusive beta testers for <strong>Aderai</strong> - 
          the AI-powered Klaviyo segmentation tool that creates 70+ expert-grade segments in seconds.
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 26px; margin: 16px 0;">
          Your test account for <strong>${brandName}</strong> is now ready to use.
        </p>

        <hr style="border: none; border-top: 1px solid #FFE8D9; margin: 24px 0;">

        <!-- Credentials Section -->
        <div style="background-color: #FFF8F3; border-radius: 8px; padding: 20px; margin: 16px 0;">
          <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 16px;">
            Your Login Credentials
          </h2>
          
          <div style="margin: 12px 0;">
            <p style="color: #6b7280; font-size: 13px; font-weight: 500; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.5px;">
              Email Address:
            </p>
            <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0; font-family: monospace;">
              ${email}
            </p>
          </div>

          <div style="margin: 12px 0;">
            <p style="color: #6b7280; font-size: 13px; font-weight: 500; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.5px;">
              Temporary Password:
            </p>
            <p style="color: #FF6B35; font-size: 18px; font-weight: 700; margin: 0; font-family: monospace; background-color: #FFE8D9; padding: 8px 12px; border-radius: 4px; display: inline-block;">
              ${tempPassword}
            </p>
          </div>

          <p style="color: #92400e; font-size: 13px; margin: 16px 0 0; background-color: #fef3c7; padding: 8px 12px; border-radius: 4px;">
            ⚠️ Please change your password after your first login for security.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #FFE8D9; margin: 24px 0;">

        <!-- Getting Started Section -->
        <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 24px 0 16px;">
          Getting Started
        </h2>
        
        <p style="color: #374151; font-size: 15px; line-height: 24px; margin: 12px 0;">
          <strong>Step 1:</strong> Click the button below to log in
        </p>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 24px 0;">
              <a href="${loginUrl}" style="background-color: #FF6B35; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; text-align: center; display: inline-block; padding: 14px 32px;">
                Log In to Aderai →
              </a>
            </td>
          </tr>
        </table>

        <p style="color: #374151; font-size: 15px; line-height: 24px; margin: 12px 0;">
          <strong>Step 2:</strong> Connect your Klaviyo account by adding your API key
        </p>

        <p style="color: #374151; font-size: 15px; line-height: 24px; margin: 12px 0;">
          <strong>Step 3:</strong> Start creating AI-powered segments instantly!
        </p>

        <hr style="border: none; border-top: 1px solid #FFE8D9; margin: 24px 0;">

        <!-- What to Test Section -->
        <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 24px 0 16px;">
          What We'd Love Your Feedback On
        </h2>
        
        <p style="color: #374151; font-size: 16px; line-height: 26px; margin: 16px 0;">
          As a beta tester, your feedback is incredibly valuable. Here are some things we'd love for you to explore:
        </p>

        <ul style="margin: 16px 0; padding-left: 24px;">
          <li style="color: #374151; font-size: 15px; line-height: 28px;">Creating segments from our pre-built library</li>
          <li style="color: #374151; font-size: 15px; line-height: 28px;">Using AI suggestions for custom segments</li>
          <li style="color: #374151; font-size: 15px; line-height: 28px;">The overall user experience and navigation</li>
          <li style="color: #374151; font-size: 15px; line-height: 28px;">Any bugs or issues you encounter</li>
          <li style="color: #374151; font-size: 15px; line-height: 28px;">Features you'd like to see added</li>
        </ul>

        <p style="color: #374151; font-size: 16px; line-height: 26px; margin: 16px 0;">
          There's a feedback widget in the app (bottom-right corner) where you can share your thoughts anytime!
        </p>

        <hr style="border: none; border-top: 1px solid #FFE8D9; margin: 24px 0;">

        <!-- Support Section -->
        <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 24px 0 16px;">
          Need Help?
        </h2>
        
        <p style="color: #374151; font-size: 16px; line-height: 26px; margin: 16px 0;">
          If you run into any issues or have questions, we're here to help:
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 26px; margin: 16px 0;">
          📧 Email us at <a href="mailto:hello@aderai.io" style="color: #FF6B35; text-decoration: underline;">hello@aderai.io</a>
        </p>

        <!-- Footer -->
        <div style="margin-top: 32px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
            Thank you for being part of the Aderai beta program!
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
            — The Aderai Team
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0; font-style: italic;">
            This is an exclusive beta invitation. Please do not share your credentials with others.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export default TestUserInvitationEmail;
