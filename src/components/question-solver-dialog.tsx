
"use client";

import React, { useState } from 'react';
import type { GeneratedQuestion } from "@/types/exam-types";
import type { SolveQuestionOutput } from '@/types/exam-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from './ui/skeleton';
import { AlertCircle, CheckCircle, Loader2, Speaker } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateAudio } from '@/app/actions';

interface QuestionSolverDialogProps {
    question: GeneratedQuestion;
    questionNumber: number;
    state?: {
        isLoading: boolean;
        solution: SolveQuestionOutput | null;
        error?: string;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuestionSolverDialog({ question, questionNumber, state, open, onOpenChange }: QuestionSolverDialogProps) {
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
    const { toast } = useToast();

    const getAudio = async () => {
        if (!state?.solution?.explanation) return;
        setIsAudioLoading(true);
        setAudioDataUri(null);

        try {
            const result = await handleGenerateAudio({ explanation: state.solution.explanation });
            
            if (result.success && result.data) {
                setAudioDataUri(result.data.audioDataUri);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Audio Generation Failed',
                    description: result.error,
                });
            }
        } catch (e) {
             toast({
                variant: 'destructive',
                title: 'An Unexpected Error Occurred',
                description: 'Failed to generate audio explanation.',
            });
        } finally {
            setIsAudioLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-2xl">
                <DialogHeader>
                    <DialogTitle>AI Solver: Question {questionNumber}</DialogTitle>
                    <DialogDescription>{question.question}</DialogDescription>
                </DialogHeader>

                <div className="prose prose-sm max-w-none dark:prose-invert py-4">
                    {state?.isLoading && (
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    )}
                    {state?.error && (
                        <div className="text-destructive flex items-center gap-2">
                             <AlertCircle className="h-5 w-5" />
                            <p>Error: {state.error}</p>
                        </div>
                    )}
                    {state?.solution && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold my-0">Explanation</h4>
                                <Button size="icon" variant="outline" onClick={getAudio} disabled={isAudioLoading}>
                                    {isAudioLoading ? <Loader2 className="animate-spin" /> : <Speaker />}
                                    <span className="sr-only">Generate Audio Explanation</span>
                                </Button>
                            </div>
                            <div
                                className="whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: state.solution.explanation.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                            />

                             {audioDataUri && (
                                <div>
                                    <audio controls autoPlay className="w-full">
                                        <source src={audioDataUri} type="audio/wav" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}

                            <div className='flex items-center gap-2 p-3 rounded-md bg-green-100 dark:bg-green-900/30 border border-green-500'>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-semibold">Correct Answer:</span>
                                <span>{state.solution.correctAnswer}</span>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
