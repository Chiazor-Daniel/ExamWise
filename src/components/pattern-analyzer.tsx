"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { handleAnalyzePatterns } from "@/app/actions";
import type { AnalyzeExamPatternsOutput } from "@/ai/flows/analyze-exam-patterns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, FlaskConical, Dna, Sigma, BookOpenText, Lightbulb } from "lucide-react";

const subjects = [
    { value: "Physics", label: "Physics", icon: Lightbulb },
    { value: "Chemistry", label: "Chemistry", icon: FlaskConical },
    { value: "Biology", label: "Biology", icon: Dna },
    { value: "Mathematics", label: "Mathematics", icon: Sigma },
    { value: "English", label: "English", icon: BookOpenText },
] as const;

const formSchema = z.object({
    subject: z.string({ required_error: "Please select a subject." }).min(1, "Please select a subject."),
    examPapers: z.string().min(100, "Please provide at least 100 characters of past paper content for analysis."),
});

type FormSchema = z.infer<typeof formSchema>;

type PatternAnalyzerProps = {
    onAnalysisComplete: (result: AnalyzeExamPatternsOutput, subject: string) => void;
};

export default function PatternAnalyzer({ onAnalysisComplete }: PatternAnalyzerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subject: "",
            examPapers: "",
        },
    });

    async function onSubmit(values: FormSchema) {
        setIsLoading(true);
        const result = await handleAnalyzePatterns(values);
        setIsLoading(false);

        if (result.success && result.data) {
            toast({ title: "Analysis Complete", description: "Patterns and topics identified successfully." });
            onAnalysisComplete(result.data, values.subject);
        } else {
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: result.error,
            });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Wand2 className="h-6 w-6 text-primary" />
                    <span>Step 1: Analyze Exam Patterns</span>
                </CardTitle>
                <CardDescription>
                    Paste content from past exam papers for a subject and our AI will identify key patterns and topics.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a subject to analyze" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {subjects.map((subject) => (
                                                <SelectItem key={subject.value} value={subject.value}>
                                                    <div className="flex items-center gap-2">
                                                        <subject.icon className="h-4 w-4" />
                                                        <span>{subject.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="examPapers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Past Paper Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Paste the text from one or more past exam papers here..."
                                            className="min-h-[250px] resize-y"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                "Analyze Patterns"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
