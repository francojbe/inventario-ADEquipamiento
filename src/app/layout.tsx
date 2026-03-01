import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardLayout } from "@/components/DashboardLayout";
import { cookies, headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AD Equipamiento Automotriz | Sistema de Gestión",
  description: "Sistema de Control de Ventas de Vidrios Automotrices - AD Equipamiento Automotriz",
  icons: {
    icon: '/logo.webp',
    apple: '/logo.webp',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const collapsed = cookieStore.get('glass_sidebar_collapsed')?.value === 'true';
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isLoginPage = pathname === '/login';

  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 antialiased`} suppressHydrationWarning>
        {isLoginPage ? (
          children
        ) : (
          <DashboardLayout defaultCollapsed={collapsed}>
            {children}
          </DashboardLayout>
        )}
      </body>
    </html>
  );
}
