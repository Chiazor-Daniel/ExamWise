// src/app/api/generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleGenerateImage } from '@/app/actions';
import type { GenerateQuestionImageInput } from "@/types/exam-types";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestionImageInput = await request.json();

    if (!body.imageDescription) {
        return NextResponse.json({ error: 'Missing required field: imageDescription.' }, { status: 400 });
    }

    const result = await handleGenerateImage(body);

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
