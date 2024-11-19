import { NextResponse, NextRequest } from "next/server";
import { sendEmail } from "@/libs/brevo";
import config from "@/config";
import { validateWebhook } from "@/libs/webhook-security";

// This route is used to receive emails from Brevo and forward them to our customer support email.
// See more: https://shipfa.st/docs/features/emails
export async function POST(req: NextRequest) {
  try {
    // Validate the webhook request
    const validationResponse = await validateWebhook(req);
    if (validationResponse) {
      return validationResponse;
    }

    const data = await req.json();

    // Extract the sender, subject and email content
    const sender = data.email;  // Brevo webhook format
    const subject = data.subject;
    const html = data.text;  // Brevo sends HTML content in the 'text' field for webhooks

    // Forward email to admin if forwardRepliesTo is set & email data exists
    if (config.email.forwardRepliesTo && html && subject && sender) {
      try {
        await sendEmail({
          to: config.email.forwardRepliesTo,
          subject: `${config?.appName} | ${subject}`,
          html: `<div><p><b>- Subject:</b> ${subject}</p><p><b>- From:</b> ${sender}</p><p><b>- Content:</b></p><div>${html}</div></div>`,
          replyTo: sender
        });
      } catch (emailError) {
        console.error('Failed to forward email:', emailError);
        // Don't return an error response here, as we still want to acknowledge the webhook
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Webhook processing error:', e?.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
