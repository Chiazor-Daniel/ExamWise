"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { handleAnalyzePatterns } from "@/app/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Upload, FileText } from "lucide-react";

const formSchema = z.object({
    subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
    examPapers: z.custom<FileList>()
      .refine((files) => files?.length > 0, 'At least one PDF file is required.')
      .refine((files) => Array.from(files).every((file) => file.type === 'application/pdf'), 'Only PDF files are allowed.'),
});

type FormSchema = z.infer<typeof formSchema>;

type PatternAnalyzerProps = {
    onAnalysisComplete: (subject: string) => void;
};

const toDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function PatternAnalyzer({ onAnalysisComplete }: PatternAnalyzerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const { toast } = useToast();

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subject: "",
        },
    });

    async function onSubmit(values: FormSchema) {
        setIsLoading(true);

        try {
            const dataUris = await Promise.all(Array.from(values.examPapers).map(toDataURL));
            const result = await handleAnalyzePatterns({
                subject: values.subject,
                examPaperUris: dataUris,
            });

            if (result.success && result.data) {
                toast({ title: "Analysis Complete", description: `Subject '${values.subject}' analyzed and saved successfully.` });
                onAnalysisComplete(values.subject);
                form.reset();
                setUploadedFiles([]);
            } else {
                toast({
                    variant: "destructive",
                    title: "Analysis Failed",
                    description: result.error,
                });
            }
        } catch (error) {
             toast({
                variant: "destructive",
                title: "File Error",
                description: "Could not read the uploaded files. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Wand2 className="h-6 w-6 text-primary" />
                    <span>Analyze a New Subject</span>
                </CardTitle>
                <CardDescription>
                    Upload past exam papers (PDFs) for a subject. The AI will analyze them and save the results.
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
                                    <FormLabel>Subject Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Physics" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="examPapers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Past Exam Papers (PDFs)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                multiple
                                                accept="application/pdf"
                                                className="hidden"
                                                id="file-upload"
                                                onChange={(e) => {
                                                    field.onChange(e.target.files);
                                                    setUploadedFiles(e.target.files ? Array.from(e.target.files) : []);
                                                }}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">PDF files only</p>
                                                </div>
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                            <p className="font-medium text-foreground">Uploaded files:</p>
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                  <FileText className="h-4 w-4" />
                                                  <span>{file.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                "Analyze & Save Subject"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}