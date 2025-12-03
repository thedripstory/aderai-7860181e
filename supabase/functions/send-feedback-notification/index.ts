import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.22.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackNotificationRequest {
  feedbackType: string;
  userName: string;
  userEmail: string;
  title?: string;
  description: string;
  metadata: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    const FeedbackSchema = z.object({
      feedbackType: z.enum(['bug_report', 'feature_request', 'general', 'complaint']),
      userName: z.string().min(1).max(255),
      userEmail: z.string().email('Invalid email').max(255),
      title: z.string().max(500).optional(),
      description: z.string().min(1).max(5000),
      metadata: z.record(z.any()),
    });

    const validationResult = FeedbackSchema.safeParse(await req.json());

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid feedback data',
          details: validationResult.error.errors 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { feedbackType, userName, userEmail, title, description, metadata } = validationResult.data;

    // Format the feedback type for display
    const typeDisplay = feedbackType === 'bug_report' ? 'Bug Report' 
      : feedbackType === 'feature_request' ? 'Feature Request' 
      : 'General Feedback';

    // Build metadata display
    const metadataItems = Object.entries(metadata)
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');

    // Send email using Resend API directly
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Akshat from Aderai <akshat@updates.aderai.io>",
        to: ["akshat@aderai.io"],
        subject: `New ${typeDisplay} from ${userName}`,
        html: `
          <h2>New ${typeDisplay} Received</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>User Information</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Name:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${userEmail}</li>
            </ul>
          </div>
          
          ${title ? `<h3>Title</h3><p>${title}</p>` : ''}
          
          <h3>Description</h3>
          <p style="white-space: pre-wrap;">${description}</p>
          
          ${metadataItems ? `
            <h3>Additional Information</h3>
            <ul>${metadataItems}</ul>
          ` : ''}
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
          
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from Aderai feedback system.
            <br>
            Submitted at: ${new Date().toLocaleString()}
          </p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const emailData = await emailResponse.json();

    console.log("Feedback notification sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailResponse: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending feedback notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
