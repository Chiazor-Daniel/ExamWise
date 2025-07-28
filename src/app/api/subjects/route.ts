// src/app/api/subjects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSubjects } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    const result = await getAvailableSubjects();

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
