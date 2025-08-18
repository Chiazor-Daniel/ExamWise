// src/app/api/analyze-patterns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleAnalyzePatterns } from '@/app/actions';
import type { AnalyzeExamPatternsInput } from "@/ai/flows/analyze-exam-patterns";

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeExamPatternsInput = await request.json(); 
    
    if (!body.subject || !body.examPaperUris || !Array.isArray(body.examPaperUris) || body.examPaperUris.length === 0) {
        return NextResponse.json({ error: 'Missing required fields: subject and examPaperUris array must be provided.' }, { status: 400 });
    }

    const result = await handleAnalyzePatterns(body);

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
