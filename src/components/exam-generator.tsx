
"use client";

import { useEffect, useState } from "react";
import { getAvailableSubjects, handleGenerateQuestions, handleSolveQuestion } from "@/app/actions";
import type { GenerateExamQuestionsOutput, GeneratedQuestion } from "@/types/exam-types";
import type { SolveQuestionOutput } from "@/types/exam-types";
import QuestionDisplay from "@/components/question-display";
import { QuestionSolverDialog } from "@/components/question-solver-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookCopy, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export type SolvingState = {
    [questionIndex: number]: {
        isLoading: boolean;
        solution: SolveQuestionOutput | null;
        error?: string;
    }
}

type ExamGeneratorProps = {
    key: number;
    initialSubjects: string[];
};

const CACHE_PREFIX = "examwise-cache-";

export default function ExamGenerator({ initialSubjects }: ExamGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [subjects, setSubjects] = useState<string[]>(initialSubjects);
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [targetYear, setTargetYear] = useState<string>(String(new Date().getFullYear() + 1));
    const [difficulty, setDifficulty] = useState<string>("Medium");
    const [generatedExam, setGeneratedExam] = useState<GenerateExamQuestionsOutput | null>(null);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
    const [solvingState, setSolvingState] = useState<SolvingState>({});
    const [openDialogs, setOpenDialogs] = useState<{[key: number]: boolean}>({});

    const { toast } = useToast();

    useEffect(() => {
        async function fetchSubjects() {
            setIsLoadingSubjects(true);
            const result = await getAvailableSubjects();
            if (result.success && result.data) {
                setSubjects(result.data);
                if (result.data.length > 0 && !selectedSubject) {
                    setSelectedSubject(result.data[0]);
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to load subjects",
                    description: result.error,
                });
            }
            setIsLoadingSubjects(false);
        }
        fetchSubjects();
    }, [toast, selectedSubject]);

    const handleGenerate = async () => {
        const year = parseInt(targetYear, 10);
        if (!selectedSubject) {
            toast({ variant: 'destructive', title: 'Please select a subject.' });
            return;
        }
        if (isNaN(year) || year < 2000) {
            toast({ variant: 'destructive', title: 'Invalid Year', description: 'Please enter a valid year (e.g., 2025).' });
            return;
        }

        setIsGenerating(true);
        setGeneratedExam(null);
        setSolvingState({});
        setOpenDialogs({});

        // Check cache first
        const cacheKey = `${CACHE_PREFIX}${selectedSubject}-${year}-${difficulty}`;
        const cachedExam = localStorage.getItem(cacheKey);
        if (cachedExam) {
            setTimeout(() => {
                setGeneratedExam(JSON.parse(cachedExam));
                toast({
                    title: "Exam Loaded from Cache!",
                    description: `Loaded mock exam for ${selectedSubject} ${year} from your browser.`,
                });
                setIsGenerating(false);
            }, 2000);
            return;
        }


        const result = await handleGenerateQuestions({
            subject: selectedSubject,
            year: year,
            difficulty: difficulty,
        });
        setIsGenerating(false);

        if (result.success && result.data) {
            setGeneratedExam(result.data);
            localStorage.setItem(cacheKey, JSON.stringify(result.data));
            toast({
                title: "Exam Generated!",
                description: `A mock exam for ${selectedSubject} ${year} has been created.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: result.error,
            });
        }
    };
    
    const clearCache = () => {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        toast({
            title: "Cache Cleared",
            description: "All cached exams and solutions have been removed from your browser."
        })
    }

    const onSolve = async (question: GeneratedQuestion, index: number) => {
        setSolvingState(prev => ({ ...prev, [index]: { isLoading: true, solution: null } }));
        setOpenDialogs(prev => ({...prev, [index]: true}));

        const cacheKey = `${CACHE_PREFIX}solution-${question.question}`;
        const cachedSolution = localStorage.getItem(cacheKey);

        if (cachedSolution) {
             setTimeout(() => {
                 setSolvingState(prev => ({...prev, [index]: { isLoading: false, solution: JSON.parse(cachedSolution) }}));
             }, 1000);
            return;
        }

        const result = await handleSolveQuestion({
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer
        });

        if (result.success && result.data) {
            setSolvingState(prev => ({...prev, [index]: { isLoading: false, solution: result.data }}));
            localStorage.setItem(cacheKey, JSON.stringify(result.data));
        } else {
            setSolvingState(prev => ({...prev, [index]: { isLoading: false, solution: null, error: result.error }}));
             toast({
                variant: "destructive",
                title: "AI Solver Failed",
                description: result.error,
            });
        }
    };

    const handleDialogClose = (index: number) => {
        setOpenDialogs(prev => ({...prev, [index]: false}));
    };

    return (
        <div className="flex-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <BookCopy className="h-6 w-6 text-primary" />
                        <span>Generate Mock Exam</span>
                    </CardTitle>
                    <CardDescription>
                       Select from a pre-analyzed subject, enter a target year, and generate a full mock exam.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            {isLoadingSubjects ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.length > 0 ? subjects.map((subject) => (
                                            <SelectItem key={subject} value={subject}>
                                                {subject}
                                            </SelectItem>
                                        )) : <SelectItem value="None" disabled>No subjects analyzed yet</SelectItem>}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="year-input">Target Year</Label>
                            <Input
                                id="year-input"
                                type="number"
                                value={targetYear}
                                onChange={(e) => setTargetYear(e.target.value)}
                                placeholder="e.g., 2025"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <Select onValueChange={setDifficulty} value={difficulty}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <Button onClick={handleGenerate} disabled={isGenerating || isLoadingSubjects || subjects.length === 0} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Exam...
                                </>
                            ) : (
                                "Generate Exam"
                            )}
                        </Button>
                         <Button onClick={clearCache} variant="outline" size="icon" aria-label="Clear cached exams">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isGenerating && (
                <div className="space-y-4">
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {generatedExam && !isGenerating && (
                <QuestionDisplay 
                    examData={generatedExam} 
                    subject={selectedSubject} 
                    year={targetYear} 
                    onSolve={onSolve}
                    solvingState={solvingState}
                />
            )}

            {generatedExam?.questions.map((q, index) => (
                 <QuestionSolverDialog
                    key={index}
                    question={q}
                    questionNumber={index + 1}
                    state={solvingState[index]}
                    open={openDialogs[index] || false}
                    onOpenChange={() => handleDialogClose(index)}
                />
            ))}
        </div>
    );
}
