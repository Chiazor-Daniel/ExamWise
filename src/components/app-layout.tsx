import type { ReactNode } from 'react';
import { Lightbulb } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Lightbulb className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary font-headline">ExamWise</h1>
          </div>
        </div>
      </header>
      <main>
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
