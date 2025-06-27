import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookCheckIcon, BookOpen, LayoutGrid, List, Download, Printer, PenToolIcon, BookCheck, ViewIcon, CogIcon, Book, WarehouseIcon, HeartPulseIcon } from 'lucide-react';
import AppLogo from './app-logo';
import { ViewColumnsIcon } from '@heroicons/react/24/outline';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Log',
        href: '/log',
        icon: BookCheckIcon,
    },
    {
        title: 'Records',
        href: '/records',
        icon: Book,
    },
    
];

const toolsNavItems: NavItem[] = [
    {
        title: 'Consultation',
        href: '/consultation',
        icon: HeartPulseIcon,
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'HomePage',
        href: '/consultation/home',
        icon: HeartPulseIcon,
    },
    {
        title: 'Attendance',
        href: '/Attendance',
        icon: BookCheckIcon,
    }
    
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Tracking Management System</SidebarGroupLabel>
                    <SidebarMenu>
                        {mainNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Consultation Management System</SidebarGroupLabel>
                    <SidebarMenu>
                        {toolsNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
