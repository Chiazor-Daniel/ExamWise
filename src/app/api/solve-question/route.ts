// src/app/api/solve-question/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleSolveQuestion } from '@/app/actions';
import type { SolveQuestionInput } from "@/types/exam-types";

export async function POST(request: NextRequest) {
  try {
    const body: SolveQuestionInput = await request.json();

    if (!body.question || !body.options || !body.correctAnswer) {
        return NextResponse.json({ error: 'Missing required fields: question, options, and correctAnswer must be provided.' }, { status: 400 });
    }
    
    const result = await handleSolveQuestion(body);

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
