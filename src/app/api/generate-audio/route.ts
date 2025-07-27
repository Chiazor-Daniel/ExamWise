// src/app/api/generate-audio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleGenerateAudio } from '@/app/actions';
import type { GenerateAudioInput } from "@/types/exam-types";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateAudioInput = await request.json();

    if (!body.explanation) {
         return NextResponse.json({ error: 'Missing required field: explanation.' }, { status: 400 });
    }
    
    const result = await handleGenerateAudio(body);

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
