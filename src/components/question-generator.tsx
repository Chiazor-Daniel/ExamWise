"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { handleGenerateQuestions } from "@/app/actions";
import type { AnalyzeExamPatternsOutput } from "@/ai/flows/analyze-exam-patterns";
import type { GenerateExamQuestionsOutput } from "@/ai/flows/generate-exam-questions";
import React from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, RefreshCw, Sparkles, ListTree, CalendarClock, BookCopy, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

type QuestionGeneratorProps = {
    analysisContext: {
        result: AnalyzeExamPatternsOutput;
        subject: string;
    };
    onReset: () => void;
};

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

type QuestionWithAnswer = GenerateExamQuestionsOutput['questions'][0] & {
    userAnswer?: string;
    isCorrect?: boolean;
};


export default function QuestionGenerator({ analysisContext, onReset }: QuestionGeneratorProps) {
    const { result: analysisResult, subject } = analysisContext;
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<QuestionWithAnswer[]>([]);
    const [targetYear, setTargetYear] = useState<string>(String(new Date().getFullYear() + 1));
    const [showResults, setShowResults] = useState(false);
    
    const { toast } = useToast();
    
    const patternSummary = useMemo(() => {
      return `Frequent Topics: ${analysisResult.frequentTopics}\n\nQuestion Patterns: ${analysisResult.questionPatterns}\n\nOverall Strategy: ${analysisResult.overallStrategy}`;
    }, [analysisResult]);

    const handleGenerate = async () => {
        const year = parseInt(targetYear, 10);
        if (isNaN(year) || year < 2000) {
            toast({
                variant: 'destructive',
                title: 'Invalid Year',
                description: 'Please enter a valid year (e.g., 2025).',
            });
            return;
        }

        setIsGenerating(true);
        setGeneratedQuestions([]);
        setShowResults(false);

        const result = await handleGenerateQuestions({
            subject,
            patternSummary,
            year: year,
        });
        setIsGenerating(false);

        if (result.success && result.data) {
            setGeneratedQuestions(result.data.questions);
            toast({
                title: "Exam Generated!",
                description: `A mock exam for ${year} has been created.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: result.error,
            });
        }
    };
    
    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setGeneratedQuestions(prev =>
            prev.map((q, i) =>
                i === questionIndex ? { ...q, userAnswer: answer } : q
            )
        );
    };
    
    const handleSubmitExam = () => {
        setGeneratedQuestions(prev =>
            prev.map(q => ({
                ...q,
                isCorrect: q.userAnswer === q.correctAnswer
            }))
        );
        setShowResults(true);
    };

    const yearRange = useMemo(() => {
        if (analysisResult.startYear && analysisResult.endYear) {
            return `${analysisResult.startYear} - ${analysisResult.endYear}`;
        }
        if (analysisResult.startYear) return `From ${analysisResult.startYear}`;
        if (analysisResult.endYear) return `Up to ${analysisResult.endYear}`;
        return 'N/A';
    }, [analysisResult.startYear, analysisResult.endYear]);

    const score = useMemo(() => {
        if (!showResults) return 0;
        return generatedQuestions.filter(q => q.isCorrect).length;
    }, [showResults, generatedQuestions]);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-start sm:items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <ListTree className="h-6 w-6 text-primary" />
                            <span>Analysis Results</span>
                        </CardTitle>
                        <CardDescription>
                            Here are the key insights from the exam papers for <span className="font-semibold text-primary">{subject}</span>.
                        </CardDescription>
                    </div>
                    <Button variant="outline" onClick={onReset} className="mt-2 sm:mt-0">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Start Over
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                        <CalendarClock className="h-5 w-5 text-primary"/>
                        <span className="font-semibold text-foreground">Detected Paper Years:</span>
                        <span>{yearRange}</span>
                    </div>
                    <Accordion type="single" collapsible defaultValue="item-1">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="font-semibold">Frequently Asked Topics</AccordionTrigger>
                            <AccordionContent className="prose prose-sm max-w-none whitespace-pre-wrap">{analysisResult.frequentTopics}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="font-semibold">Common Question Patterns</AccordionTrigger>
                            <AccordionContent className="prose prose-sm max-w-none whitespace-pre-wrap">{analysisResult.questionPatterns}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger className="font-semibold">Recommended Study Strategy</AccordionTrigger>
                            <AccordionContent className="prose prose-sm max-w-none whitespace-pre-wrap">{analysisResult.overallStrategy}</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <BookCopy className="h-6 w-6 text-primary" />
                        <span>Step 2: Generate Mock Exam</span>
                    </CardTitle>
                    <CardDescription>
                       Enter a target year to generate a full mock exam based on the analysis.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                         <div className="flex-1 space-y-2">
                            <Label htmlFor="year-input">Target Year</Label>
                            <Input
                                id="year-input"
                                type="number"
                                value={targetYear}
                                onChange={(e) => setTargetYear(e.target.value)}
                                placeholder="e.g., 2025"
                            />
                        </div>
                        <Button onClick={handleGenerate} disabled={isGenerating} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Exam...
                                </>
                            ) : (
                                "Generate Exam"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isGenerating && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
            )}

            {generatedQuestions.length > 0 && (
                 <div className="space-y-6">
                    <h3 className="text-2xl font-bold tracking-tight font-headline">Mock Exam: {subject} {targetYear}</h3>
                    {showResults && (
                        <Card className="bg-muted/50">
                            <CardHeader>
                                <CardTitle>Exam Results</CardTitle>
                                <CardDescription>You scored {score} out of {generatedQuestions.length}!</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                    <div className="space-y-4">
                        {generatedQuestions.map((q, index) => (
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
                                        {q.options.map((option, optionIndex) => {
                                            const isCorrectAnswer = showResults && option === q.correctAnswer;
                                            const isWrongSelection = showResults && option === q.userAnswer && !q.isCorrect;
                                            
                                            return (
                                                <div key={optionIndex} className={`flex items-center space-x-2 p-3 rounded-md border ${isCorrectAnswer ? 'bg-green-100 border-green-500' : ''} ${isWrongSelection ? 'bg-red-100 border-red-500' : ''}`}>
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
                                        <p className="text-sm text-green-700 font-medium">Correct answer: {q.correctAnswer}</p>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                    {!showResults && (
                        <Button onClick={handleSubmitExam} size="lg" className="w-full">Submit Exam</Button>
                    )}
                 </div>
            )}
        </div>
    );
}
