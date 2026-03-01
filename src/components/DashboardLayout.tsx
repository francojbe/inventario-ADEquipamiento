'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Users,
    Hammer,
    Settings,
    Menu,
    X,
    Bell,
    Search,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    PackageOpen,
    LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function DashboardLayout({ children, defaultCollapsed = false }: { children: React.ReactNode, defaultCollapsed?: boolean }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);

    // Notifications State
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        document.cookie = `glass_sidebar_collapsed=${newState}; path=/; max-age=31536000`;
    };

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Nueva Venta', href: '/installations/new', icon: Hammer },
        { name: 'Historial de Ventas', href: '/installations', icon: Search },
        { name: 'Stock (PRO)', href: '/inventory', icon: Package },
        { name: 'Clientes (PRO)', href: '/customers', icon: Users },
    ];

    const bottomNavigation = [
        { name: 'Configuración', href: '#', icon: Settings },
    ];

    return (
        <div className="min-h-screen lg:h-screen bg-[#F6F8FA] flex flex-col md:flex-row font-sans overflow-x-hidden">

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
          md:sticky md:top-0 md:h-screen md:translate-x-0 shrink-0
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
            >
                {/* Floating Collapse Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-5 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-gray-600 shadow-sm hidden md:flex z-50 transition-colors hover:bg-gray-50"
                >
                    {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>

                <div className={`h-12 flex items-center border-b border-gray-100 shrink-0 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 justify-between'}`}>
                    <div className={`flex items-center gap-2 overflow-hidden whitespace-nowrap`}>
                        <img
                            src="/logo.webp"
                            alt="AD Equipamiento Automotriz"
                            className={`object-contain shrink-0 transition-all ${isSidebarCollapsed ? 'h-8 w-8' : 'h-9 w-auto max-w-[140px]'}`}
                        />
                    </div>

                    <button
                        className="md:hidden text-gray-500 hover:text-gray-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150
                                  ${isActive
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent pl-2'
                                    }
                                `}
                            >
                                <item.icon
                                    className={`
                                      flex-shrink-0 h-5 w-5 transition-colors
                                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                                      ${isSidebarCollapsed ? 'mr-0' : 'mr-3'}
                                    `}
                                    aria-hidden="true"
                                />
                                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-gray-100 pb-4">
                    {bottomNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150
                                  ${isActive
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent pl-2'
                                    }
                                `}
                            >
                                <item.icon
                                    className={`
                                      flex-shrink-0 h-5 w-5 transition-colors
                                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                                      ${isSidebarCollapsed ? 'mr-0' : 'mr-3'}
                                    `}
                                    aria-hidden="true"
                                />
                                {!isSidebarCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-hidden">

                {/* Header Compact */}
                <header className="bg-white border-b border-gray-200 h-12 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 sticky top-0 transition-all">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="md:hidden -ml-2 mr-3 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        </button>

                        <div className="hidden lg:flex items-center px-3 py-1.5 border border-gray-200 rounded-md bg-gray-50 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 w-64 transition-all">
                            <Search className="h-4 w-4 text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="bg-transparent border-none focus:ring-0 text-sm p-0 w-full text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3" ref={notifRef}>
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="text-gray-400 hover:text-blue-600 relative p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                            >
                                <Bell className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                            AD
                        </div>
                        <a
                            href="/api/logout"
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </a>
                    </div>
                </header>

                <main className="flex-1 overflow-auto lg:overflow-hidden bg-[#F6F8FA]">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2 sm:py-3 lg:py-1.5 w-full lg:h-full">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    );
}
