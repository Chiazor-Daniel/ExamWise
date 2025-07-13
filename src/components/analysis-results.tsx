"use client";

import type { GetAnalysisForSubjectOutput } from "@/app/actions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, ListTree } from "lucide-react";
import { useMemo } from "react";

type AnalysisResultsProps = {
    analysisResult: GetAnalysisForSubjectOutput;
    subject: string;
};

export default function AnalysisResults({ analysisResult, subject }: AnalysisResultsProps) {

    const yearRange = useMemo(() => {
        if (analysisResult.startYear && analysisResult.endYear) {
            return `${analysisResult.startYear} - ${analysisResult.endYear}`;
        }
        if (analysisResult.startYear) return `From ${analysisResult.startYear}`;
        if (analysisResult.endYear) return `Up to ${analysisResult.endYear}`;
        return 'N/A';
    }, [analysisResult.startYear, analysisResult.endYear]);


    return (
        <Card>
            <CardHeader>
                <div>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <ListTree className="h-6 w-6 text-primary" />
                        <span>Analysis Results for <span className="text-primary">{subject}</span></span>
                    </CardTitle>
                    <CardDescription>
                        Here are the key insights from the analyzed exam papers.
                    </CardDescription>
                </div>
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
    );
}