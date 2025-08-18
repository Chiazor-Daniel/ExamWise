
"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ExamGenerator from "@/components/exam-generator";
import SubjectManager from "@/components/subject-manager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

function ExamWiseClient() {
  const [activeTab, setActiveTab] = useState("generator");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [analysisVersion, setAnalysisVersion] = useState(0);

  const onAnalysisComplete = (newSubjects: string[]) => {
    setSubjects(newSubjects);
    setAnalysisVersion(prev => prev + 1); // Force re-fetch in generator
    setActiveTab("generator");
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
       <div className="flex flex-col items-center justify-center mb-8">
         <Image src="data:image/png;base64,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" alt="ExamWise Logo" width="100" height="100" />
         <h1 className="text-4xl font-bold tracking-tight font-headline mt-2">ExamWise</h1>
        
       </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Exam Generator</TabsTrigger>
          <TabsTrigger value="manager">Manage Subjects</TabsTrigger>
        </TabsList>
        <TabsContent value="generator">
          <ExamGenerator key={analysisVersion} initialSubjects={subjects} />
        </TabsContent>
        <TabsContent value="manager">
          <SubjectManager onAnalysisComplete={onAnalysisComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Home() {
    return <ExamWiseClient />;
}
