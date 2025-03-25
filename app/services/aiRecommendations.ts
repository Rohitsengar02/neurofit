import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export interface HealthRecommendation {
  type: 'workout' | 'nutrition' | 'mental' | 'sleep' | 'cardio';
  title: string;
  description: string;
}

export const generateHealthRecommendations = async (
  userProfile?: {
    age?: number;
    weight?: number;
    height?: number;
    activityLevel?: string;
    goals?: string[];
  }
): Promise<HealthRecommendation[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `As an AI health and fitness expert, provide 4 personalized health recommendations for today. 
  Each recommendation should be different (workout, nutrition, mental health, sleep, or cardio).
  
  ${userProfile ? `Consider this user profile:
  - Age: ${userProfile.age || 'Not specified'}
  - Weight: ${userProfile.weight || 'Not specified'} kg
  - Height: ${userProfile.height || 'Not specified'} cm
  - Activity Level: ${userProfile.activityLevel || 'Not specified'}
  - Goals: ${userProfile.goals?.join(', ') || 'Not specified'}` : ''}

  Format each recommendation as:
  TYPE: [one of: workout, nutrition, mental, sleep, cardio]
  TITLE: [short, actionable title]
  DESCRIPTION: [2-3 sentences with specific, practical advice]

  Ensure recommendations are:
  1. Specific and actionable
  2. Evidence-based
  3. Realistic for daily implementation
  4. Varied across different health aspects`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the structured text response
    const recommendations = text.split(/\n\n/)
      .filter(block => block.trim())
      .map(block => {
        const type = (block.match(/TYPE:\s*(\w+)/)?.[1] || 'workout') as HealthRecommendation['type'];
        const title = block.match(/TITLE:\s*([^\n]+)/)?.[1] || '';
        const description = block.match(/DESCRIPTION:\s*([^\n]+)/)?.[1] || '';

        return {
          type,
          title,
          description
        };
      })
      .filter(rec => rec.title && rec.description);

    return recommendations;
  } catch (error) {
    console.error('Error generating health recommendations:', error);
    return [];
  }
};
