"use client";

import { useState } from 'react';
import type { AnalyzeExamPatternsOutput } from '@/ai/flows/analyze-exam-patterns';
import AppLayout from '@/components/app-layout';
import PatternAnalyzer from '@/components/pattern-analyzer';
import QuestionGenerator from '@/components/question-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function Home() {
  const [analysisContext, setAnalysisContext] = useState<{ result: AnalyzeExamPatternsOutput; subject: string } | null>(null);
  const [analysisKey, setAnalysisKey] = useState(0); 

  const handleAnalysisComplete = (result: AnalyzeExamPatternsOutput, subject: string) => {
    setAnalysisContext({ result, subject });
  };

  const handleReset = () => {
    setAnalysisContext(null);
    setAnalysisKey(prevKey => prevKey + 1);
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">ExamWise Dashboard</h1>
            <p className="text-muted-foreground">
              Analyze past papers and generate practice questions with AI.
            </p>
          </div>
        </div>
        
        {analysisContext ? (
          <QuestionGenerator analysisContext={analysisContext} onReset={handleReset} />
        ) : (
          <PatternAnalyzer key={analysisKey} onAnalysisComplete={handleAnalysisComplete} />
        )}
      </div>
    </AppLayout>
  );
}
