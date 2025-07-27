// src/app/api/generate-questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleGenerateQuestions } from '@/app/actions';
import type { GenerateExamQuestionsInput } from '@/types/exam-types';

type RequestBody = Omit<GenerateExamQuestionsInput, 'patternSummary'>;

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    if (!body.subject || !body.year || !body.difficulty) {
        return NextResponse.json({ error: 'Missing required fields: subject, year, and difficulty must be provided.' }, { status: 400 });
    }

    const result = await handleGenerateQuestions(body);

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: `An unexpected error occurred on the server. ${errorMessage}` }, { status: 500 });
  }
}
