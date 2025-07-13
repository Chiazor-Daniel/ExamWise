import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, BookCopy, Settings } from 'lucide-react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Exam Generator', icon: BookCopy },
    { href: '/manage', label: 'Manage Subjects', icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Sidebar>
                <SidebarHeader>
                    <div className="flex gap-2 items-center p-2">
                        <Lightbulb className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold text-primary font-headline">ExamWise</h1>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <Link href={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <span>
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>

            <SidebarInset>
                 <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <SidebarTrigger className="md:hidden" />
                 </header>
                 <main className="flex-1">
                    {children}
                 </main>
            </SidebarInset>
        </div>
    );
}
