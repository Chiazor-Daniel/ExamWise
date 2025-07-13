"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { GenerateExamQuestionsOutput } from "@/ai/flows/generate-exam-questions";
import React from 'react';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sparkles, CheckCircle, XCircle } from "lucide-react";

type QuestionWithAnswer = GenerateExamQuestionsOutput['questions'][0] & {
    userAnswer?: string;
    isCorrect?: boolean;
};

type QuestionDisplayProps = {
    examData: GenerateExamQuestionsOutput;
    subject: string;
    year: string;
}

function HighlightedQuestion({ text }: { text: string }) {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\[Image.*?\])/g);
    return (
        <p className="leading-relaxed">
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="text-primary">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('[') && part.endsWith(']')) {
                    return <span key={index} className="text-sm text-muted-foreground font-style: italic">{part}</span>;
                }
                return part;
            })}
        </p>
    );
}

export default function QuestionDisplay({ examData, subject, year }: QuestionDisplayProps) {
    const [questions, setQuestions] = useState<QuestionWithAnswer[]>(examData.questions);
    const [showResults, setShowResults] = useState(false);

     const handleAnswerChange = (questionIndex: number, answer: string) => {
        setQuestions(prev =>
            prev.map((q, i) =>
                i === questionIndex ? { ...q, userAnswer: answer } : q
            )
        );
    };
    
    const handleSubmitExam = () => {
        setQuestions(prev =>
            prev.map(q => ({
                ...q,
                isCorrect: q.userAnswer === q.correctAnswer
            }))
        );
        setShowResults(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const score = useMemo(() => {
        if (!showResults) return 0;
        return questions.filter(q => q.isCorrect).length;
    }, [showResults, questions]);

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight font-headline">Mock Exam: {subject} {year}</h3>
            {showResults && (
                <Card className="bg-muted/50 sticky top-[60px] z-10">
                    <CardHeader>
                        <CardTitle>Exam Results</CardTitle>
                        <p className="text-lg">You scored <span className="font-bold text-primary">{score}</span> out of <span className="font-bold text-primary">{questions.length}</span>!</p>
                    </CardHeader>
                </Card>
            )}
            <div className="space-y-4">
                {questions.map((q, index) => (
                    <Card key={index} className={showResults ? (q.isCorrect ? 'border-green-500' : 'border-destructive') : ''}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <p className="font-semibold">Question {index + 1}</p>
                                {q.isAiGenerated && (
                                    <Badge variant="outline" className="w-fit bg-primary/10 border-primary/50 text-primary font-medium">
                                        <Sparkles className="mr-1.5 h-3 w-3" />
                                        AI Assisted
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <HighlightedQuestion text={q.highlightedQuestion} />
                            {q.imageDataUri && (
                                <div className="relative aspect-video w-full max-w-md mx-auto my-4 rounded-lg overflow-hidden border">
                                    <Image src={q.imageDataUri} alt={q.imageDescription || 'Generated image for question'} layout="fill" objectFit="contain" data-ai-hint="diagram illustration" />
                                </div>
                            )}
                            <RadioGroup
                                value={q.userAnswer}
                                onValueChange={(value) => handleAnswerChange(index, value)}
                                disabled={showResults}
                            >
                                {q.options.filter(opt => opt !== undefined && opt !== null).map((option, optionIndex) => {
                                    const isCorrectAnswer = showResults && option === q.correctAnswer;
                                    const isWrongSelection = showResults && option === q.userAnswer && !q.isCorrect;
                                    
                                    return (
                                        <div key={optionIndex} className={`flex items-center space-x-2 p-3 rounded-md border transition-colors ${isCorrectAnswer ? 'bg-green-100 dark:bg-green-900/30 border-green-500' : ''} ${isWrongSelection ? 'bg-red-100 dark:bg-red-900/30 border-red-500' : ''}`}>
                                            <RadioGroupItem value={option} id={`q${index}-o${optionIndex}`} />
                                            <Label htmlFor={`q${index}-o${optionIndex}`} className="flex-1 cursor-pointer">{option}</Label>
                                            {isCorrectAnswer && <CheckCircle className="h-5 w-5 text-green-600" />}
                                            {isWrongSelection && <XCircle className="h-5 w-5 text-red-600" />}
                                        </div>
                                    );
                                })}
                            </RadioGroup>
                        </CardContent>
                        {showResults && !q.isCorrect && (
                            <CardFooter>
                                <p className="text-sm text-green-700 dark:text-green-400 font-medium">Correct answer: {q.correctAnswer}</p>
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
            {!showResults && (
                <Button onClick={handleSubmitExam} size="lg" className="w-full">Submit Exam</Button>
            )}
        </div>
    )
}
