import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, BookCopy, Settings, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Exam Generator', icon: BookCopy },
    { href: '/manage', label: 'Manage Subjects', icon: Settings },
];

const NavLink = ({ href, label, icon: Icon, currentPath }: { href: string; label: string; icon: React.ElementType; currentPath: string }) => {
    const isActive = currentPath === href;
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary'
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    );
};

const SidebarContent = () => {
    const pathname = usePathname();
    return (
        <>
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Lightbulb className="h-6 w-6 text-primary" />
                        {/* <span className="font-headline text-xl">ExamWise</span> */}
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navItems.map((item) => (
                            <NavLink key={item.href} {...item} icon={item.icon} currentPath={pathname} />
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <SidebarContent />
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <PanelLeft className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0">
                           <SidebarContent />
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1" />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
