
"use client";

import { useState, useEffect } from "react";
import PatternAnalyzer from '@/components/pattern-analyzer';
import AnalysisResults from '@/components/analysis-results';
import { getAnalysisForSubject, type GetAnalysisForSubjectOutput } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getAvailableSubjects } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";


type SubjectManagerProps = {
    onAnalysisComplete: (subjects: string[]) => void;
};


export default function SubjectManager({ onAnalysisComplete }: SubjectManagerProps) {
    const [subjects, setSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<GetAnalysisForSubjectOutput | null>(null);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

    const { toast } = useToast();

    const fetchSubjects = async () => {
        setIsLoadingSubjects(true);
        const result = await getAvailableSubjects();
        if (result.success && result.data) {
            setSubjects(result.data);
        } else {
            toast({
                variant: "destructive",
                title: "Failed to load subjects",
                description: result.error,
            });
        }
        setIsLoadingSubjects(false);
    };

    useEffect(() => {
        fetchSubjects();
    }, [toast]);
    
    useEffect(() => {
        if (selectedSubject) {
            const fetchAnalysis = async () => {
                setIsLoadingAnalysis(true);
                const result = await getAnalysisForSubject(selectedSubject);
                if (result.success && result.data) {
                    setAnalysisResult(result.data);
                } else {
                    setAnalysisResult(null);
                    toast({
                        variant: 'destructive',
                        title: `Could not load analysis for ${selectedSubject}`,
                        description: result.error
                    });
                }
                setIsLoadingAnalysis(false);
            };
            fetchAnalysis();
        } else {
            setAnalysisResult(null);
        }
    }, [selectedSubject, toast]);

    const handleAnalysisComplete = async (subject: string) => {
        await fetchSubjects();
        setSelectedSubject(subject);
        const result = await getAvailableSubjects();
        if (result.success && result.data) {
            onAnalysisComplete(result.data);
        }
    }
    
    return (
        <div className="flex-1 space-y-8">
            <PatternAnalyzer onAnalysisComplete={handleAnalysisComplete} />

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                       <Label>View Existing Analysis</Label>
                       {isLoadingSubjects ? (
                            <Skeleton className="h-10 w-full max-w-sm" />
                        ) : (
                            <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                                <SelectTrigger className="w-full max-w-sm">
                                    <SelectValue placeholder="Select a subject to view its analysis" />
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
                </CardContent>
            </Card>

            {isLoadingAnalysis && (
                <div className="space-y-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-1/3" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {analysisResult && (
                <AnalysisResults analysisResult={analysisResult} subject={selectedSubject} />
            )}
        </div>
    );
}
