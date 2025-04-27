import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Define global type for OTP storage
declare global {
  var otpStore: Map<string, { otp: string; expires: number }>;
}

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.error('SENDGRID_API_KEY is not defined in environment variables');
}

// Generate a 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in a temporary storage with expiration (normally would use Redis or similar)
    // For demo purposes, we'll use a global Map with expiration logic
    // In production, use a proper database or caching solution
    if (!global.otpStore) {
      global.otpStore = new Map<string, { otp: string; expires: number }>();
    }
    
    global.otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes expiration
    });

    // Create email message
    const msg = {
      to: email,
      from: 'gsengar733@gmail.com', // Use your verified sender
      subject: 'Your NeuroFit Verification Code',
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">NeuroFit</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #4F46E5; margin-top: 0;">Verification Code</h2>
            <p>Thank you for signing up with NeuroFit. To complete your registration, please use the following verification code:</p>
            <div style="background-color: #e9e9e9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; letter-spacing: 5px; font-size: 24px; font-weight: bold;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    // Send email
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send(msg);
      return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } else {
      console.log('SENDGRID_API_KEY not found, would have sent OTP:', otp);
      return NextResponse.json({ 
        success: true, 
        message: 'OTP generated (but not sent due to missing API key)',
        otp // Only included for development without SendGrid setup
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
