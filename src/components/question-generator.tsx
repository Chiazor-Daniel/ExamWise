"use client";

import { useState, useMemo } from "react";
import { handleGenerateQuestions } from "@/app/actions";
import type { AnalyzeExamPatternsOutput } from "@/ai/flows/analyze-exam-patterns";
import type { GenerateExamQuestionsOutput } from "@/ai/flows/generate-exam-questions";
import React from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, RefreshCw, Sparkles, ListTree, CalendarClock, Lightbulb, TestTube2, Sigma, BookOpenText } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

type QuestionGeneratorProps = {
    analysisContext: {
        result: AnalyzeExamPatternsOutput;
        subject: string;
    };
    onReset: () => void;
};

function HighlightedQuestion({ text }: { text: string }) {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <p>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="text-primary">{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </p>
    );
}

export default function QuestionGenerator({ analysisContext, onReset }: QuestionGeneratorProps) {
    const { result: analysisResult, subject } = analysisContext;
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<GenerateExamQuestionsOutput['questions']>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>("all");
    const [numQuestions, setNumQuestions] = useState<string>("3");
    
    const { toast } = useToast();

    const topics = useMemo(() => {
        if (!analysisResult.frequentTopics) return [];
        return analysisResult.frequentTopics
            .split('\n')
            .map(line => line.replace(/^[*-]\s*/, '').trim())
            .filter(Boolean);
    }, [analysisResult.frequentTopics]);
    
    const patternSummary = useMemo(() => {
      return `Frequent Topics: ${analysisResult.frequentTopics}\n\nQuestion Patterns: ${analysisResult.questionPatterns}\n\nOverall Strategy: ${analysisResult.overallStrategy}`;
    }, [analysisResult]);

    const handleGenerate = async () => {
        if (selectedTopic === 'all') {
            toast({
                variant: 'destructive',
                title: 'Please select a topic',
                description: 'You must choose a specific topic to generate questions for.',
            });
            return;
        }

        setIsGenerating(true);
        const result = await handleGenerateQuestions({
            subject,
            topic: selectedTopic,
            patternSummary,
            numQuestions: parseInt(numQuestions, 10),
        });
        setIsGenerating(false);

        if (result.success && result.data) {
            setGeneratedQuestions(prev => [...result.data.questions, ...prev]);
            toast({
                title: "Questions Generated",
                description: `${result.data.questions.length} new questions have been added.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: result.error,
            });
        }
    };

    const yearRange = useMemo(() => {
        if (analysisResult.startYear && analysisResult.endYear) {
            return `${analysisResult.startYear} - ${analysisResult.endYear}`;
        }
        if (analysisResult.startYear) return `From ${analysisResult.startYear}`;
        if (analysisResult.endYear) return `Up to ${analysisResult.endYear}`;
        return 'N/A';
    }, [analysisResult.startYear, analysisResult.endYear]);

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
                        <Sparkles className="h-6 w-6 text-primary" />
                        <span>Step 2: Generate Practice Questions</span>
                    </CardTitle>
                    <CardDescription>
                        Use the analysis to generate new questions. Choose a topic and how many questions you want.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                         <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Topic</label>
                            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a topic" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" disabled>Select a topic</SelectItem>
                                    {topics.map((topic, index) => (
                                        <SelectItem key={index} value={topic}>{topic}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Number of Questions</label>
                            <Select value={numQuestions} onValueChange={setNumQuestions}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 5, 10].map(num => (
                                        <SelectItem key={num} value={String(num)}>{num} Question{num > 1 ? 's': ''}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={handleGenerate} disabled={isGenerating || selectedTopic === 'all'} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            "Generate Questions"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {generatedQuestions.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="text-2xl font-bold tracking-tight font-headline">Generated Questions</h3>
                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {generatedQuestions.map((q, index) => (
                            <Card key={index}>
                                <CardHeader>
                                  {q.isAiGenerated && (
                                    <Badge variant="outline" className="w-fit bg-primary/10 border-primary/50 text-primary font-medium">
                                      <Sparkles className="mr-1.5 h-3 w-3" />
                                      AI Generated
                                    </Badge>
                                  )}
                                </CardHeader>
                                <CardContent>
                                    <HighlightedQuestion text={q.highlightedQuestion} />
                                </CardContent>
                            </Card>
                        ))}
                     </div>
                 </div>
            )}
        </div>
    );
}
