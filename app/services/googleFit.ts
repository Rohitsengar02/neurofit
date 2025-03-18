import { auth } from '../utils/firebase';

const GOOGLE_FIT_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID || '';
const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.nutrition.read'
];

export interface HealthData {
  steps: number;
  calories: number;
  heartRate: {
    average: number;
    min: number;
    max: number;
  };
  sleep: {
    duration: number;
    quality: string;
  };
  activities: Array<{
    type: string;
    duration: number;
    calories: number;
    timestamp: string;
  }>;
  weight: number;
  height: number;
  bmi: number;
}

interface GoogleAuthError {
  error?: string;
  details?: string;
  message?: string;
}

const loadGapiScript = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.head.appendChild(script);
  });
};

const loadAuth2 = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      reject(new Error('Google API not loaded'));
      return;
    }

    window.gapi.load('auth2:client', {
      callback: () => {
        if (!window.gapi.auth2) {
          reject(new Error('Auth2 module failed to load'));
          return;
        }

        window.gapi.auth2.init({
          client_id: GOOGLE_FIT_CLIENT_ID,
          scope: GOOGLE_FIT_SCOPES.join(' '),
          fetch_basic_profile: false
        }).then(() => resolve())
          .catch((error: GoogleAuthError) => reject(error));
      },
      onerror: () => reject(new Error('Error loading auth2 module')),
      timeout: 5000,
      ontimeout: () => reject(new Error('Timeout loading auth2 module'))
    });
  });
};

const loadFitnessAPI = async (): Promise<void> => {
  if (!window.gapi?.client) {
    throw new Error('Google API client not initialized');
  }

  await window.gapi.client.load('fitness', 'v1');
};

export async function authorizeGoogleFit(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in. Please sign in first.');
    }

    if (!GOOGLE_FIT_CLIENT_ID) {
      throw new Error('Google Fit Client ID not configured in environment variables');
    }

    // Step 1: Load the GAPI script
    console.log('Loading Google API script...');
    await loadGapiScript();

    // Step 2: Load and initialize auth2
    console.log('Loading and initializing auth2...');
    await loadAuth2();

    // Step 3: Check if we're authorized
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (!authInstance) {
      throw new Error('Failed to get Google auth instance');
    }

    // Step 4: Sign in if needed
    if (!authInstance.isSignedIn.get()) {
      console.log('Signing in to Google Fit...');
      try {
        await new Promise<void>((resolve, reject) => {
          authInstance.signIn({
            prompt: 'consent',
            ux_mode: 'popup'
          }).then(() => {
            resolve();
          }).catch((error: GoogleAuthError) => {
            console.error('Google Sign-in error:', error);
            if (error?.error === 'popup_blocked_by_browser') {
              reject(new Error('Please allow popups for this site to sign in with Google Fit'));
            } else if (error?.error === 'idpiframe_initialization_failed') {
              const currentOrigin = window.location.origin;
              reject(new Error(
                `Google Fit API authorization failed. Please ensure:\n` +
                `1. "${currentOrigin}" is added to Authorized JavaScript origins in Google Cloud Console\n` +
                `2. Google Fit API is enabled in your project\n` +
                `3. OAuth consent screen is configured\n` +
                `4. You're using a secure context (https:// or localhost)\n\n` +
                `Error details: ${error.details || error.message || 'No additional details available'}`
              ));
            } else {
              reject(error);
            }
          });
        });
      } catch (error) {
        const authError = error as GoogleAuthError;
        console.error('Google Sign-in error details:', {
          error: authError?.error,
          message: authError?.message,
          details: authError?.details
        });
        throw error;
      }
    }

    // Step 5: Initialize Fitness API
    console.log('Loading Fitness API...');
    await loadFitnessAPI();
    
    console.log('Successfully authorized Google Fit');
  } catch (error) {
    // Check if it's a known error type
    const authError = error as GoogleAuthError;
    console.error('Google Fit authorization error:', {
      error: authError?.error,
      message: authError?.message,
      details: authError?.details,
      stack: authError instanceof Error ? authError.stack : undefined
    });

    if (authError?.error === 'popup_closed_by_user') {
      throw new Error('Sign-in cancelled. Please try again and complete the Google sign-in process.');
    }

    // Handle other errors
    const errorMessage = authError?.message || authError?.error || authError?.details || 
      (typeof error === 'string' ? error : 'Unknown error occurred');
    
    throw new Error(`Google Fit authorization failed: ${errorMessage}`);
  }
}

export async function fetchHealthData(timeRange: { start: Date; end: Date }): Promise<HealthData> {
  try {
    if (!window.gapi?.client?.fitness) {
      await authorizeGoogleFit();
    }

    const startTime = timeRange.start.getTime();
    const endTime = timeRange.end.getTime();

    // Fetch steps data
    const stepsResponse = await window.gapi.client.fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{
          dataTypeName: 'com.google.step_count.delta'
        }],
        startTimeMillis: startTime,
        endTimeMillis: endTime,
        bucketByTime: { durationMillis: 86400000 }
      }
    });

    // Process and return data
    return {
      steps: calculateTotalSteps(stepsResponse.result),
      calories: 0,
      heartRate: {
        average: 0,
        min: 0,
        max: 0
      },
      sleep: {
        duration: 0,
        quality: 'Unknown'
      },
      activities: [],
      weight: 0,
      height: 0,
      bmi: 0
    };
  } catch (error) {
    console.error('Error fetching health data:', error);
    throw error;
  }
}

function calculateTotalSteps(data: any): number {
  try {
    return data.bucket.reduce((total: number, bucket: any) => {
      const steps = bucket.dataset[0].point[0]?.value[0]?.intVal || 0;
      return total + steps;
    }, 0);
  } catch (error) {
    console.error('Error calculating steps:', error);
    return 0;
  }
}
