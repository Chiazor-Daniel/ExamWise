// src/app/api/subjects/[subject]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisForSubject } from '@/app/actions';

type RouteParams = {
    params: {
        subject: string;
    }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const subject = decodeURIComponent(params.subject);

    if (!subject) {
        return NextResponse.json({ error: 'Subject parameter is required.' }, { status: 400 });
    }
    
    const result = await getAnalysisForSubject(subject);

    if (result.success) {
      if (result.data) {
        return NextResponse.json(result.data);
      }
      return NextResponse.json({ error: `No analysis found for subject: ${subject}`}, { status: 404 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: `An unexpected error occurred on the server. ${errorMessage}` }, { status: 500 });
  }
}
