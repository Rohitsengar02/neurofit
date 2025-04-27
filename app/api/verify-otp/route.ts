import { NextResponse } from 'next/server';

// Define global type for OTP storage
declare global {
  var otpStore: Map<string, { otp: string; expires: number }>;
}

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Get OTP from storage
    if (!global.otpStore) {
      global.otpStore = new Map<string, { otp: string; expires: number }>();
    }
    const storedData = global.otpStore.get(email);

    if (!storedData) {
      return NextResponse.json(
        { success: false, message: 'No OTP found for this email' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expires) {
      global.otpStore.delete(email); // Clean up expired OTP
      return NextResponse.json(
        { success: false, message: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid, clean up
    global.otpStore.delete(email);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
