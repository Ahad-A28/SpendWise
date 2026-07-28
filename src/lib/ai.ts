import { Expense, CategoryBudget } from './types';

export async function generateAIResponse(
  message: string,
  expenses: Expense[],
  budgets: CategoryBudget[],
  isAgentMode: boolean = false,
  token: string | null = null,
  fileData?: { name: string; mimeType: string; data: string } | null
): Promise<{ text?: string, error?: string, actionExecuted?: string, creditsRemaining?: number }> {
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ message, expenses, budgets, isAgentMode, fileData }),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      if (response.status === 413) {
        return { error: 'The uploaded file is too large. Please upload a smaller file.' };
      }
      return { error: `Server error (${response.status}): The server returned an unexpected response.` };
    }
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        return { error: data.error };
      }
      throw new Error(data.error || 'Failed to communicate with AI server');
    }

    return data;
  } catch (error: any) {
    console.error('AI Response Error:', error);
    return { error: error.message || "I'm having trouble connecting to the AI server right now." };
  }
}
