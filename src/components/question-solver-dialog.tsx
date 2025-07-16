
"use client";

import React, { useRef, useState, useEffect } from 'react';
import type { GeneratedQuestion } from "@/types/exam-types";
import type { SolveQuestionOutput } from '@/types/exam-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { AlertCircle, Volume2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

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
    const dialogRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Center the dialog initially when it opens
        if (open && dialogRef.current) {
            const { innerWidth, innerHeight } = window;
            const { offsetWidth, offsetHeight } = dialogRef.current;
            setPosition({
                x: (innerWidth - offsetWidth) / 2,
                y: (innerHeight - offsetHeight) / 2
            });
        }
    }, [open]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (dialogRef.current) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                ref={dialogRef}
                className="w-full max-w-2xl transform-none top-auto left-auto"
                style={{
                    position: 'fixed',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    cursor: isDragging ? 'grabbing' : 'grab',
                }}
                onPointerDown={(e) => e.stopPropagation()} // prevent Dialog default behavior
                onInteractOutside={(e) => e.preventDefault()} // prevent closing on outside click
            >
                <DialogHeader 
                    onMouseDown={handleMouseDown}
                    className="cursor-grab"
                >
                    <DialogTitle>AI Solver: Question {questionNumber}</DialogTitle>
                    <DialogDescription>{question.question}</DialogDescription>
                </DialogHeader>

                <div className="prose prose-sm max-w-none dark:prose-invert">
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
                            <div>
                                <h4 className="font-bold">Explanation</h4>
                                <div
                                    className="whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: state.solution.explanation.replace(/\n/g, '<br />') }}
                                />
                            </div>

                             {state.solution.audioDataUri && (
                                <div>
                                    <h4 className="font-bold mb-2">Audio Explanation</h4>
                                    <audio controls className="w-full">
                                        <source src={state.solution.audioDataUri} type="audio/wav" />
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
