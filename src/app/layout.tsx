// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "HojaVerde - Sistema de Control de Asistencia",
  description: "Sistema de gestión de asistencia para empleados agrícolas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Tailwind CSS CDN - temporal para desarrollo rápido */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      sans: ['var(--font-inter)', 'sans-serif'],
                      serif: ['var(--font-playfair)', 'serif'],
                    },
                    colors: {
                      'hoja-green': {
                        50: '#f0f9f0',
                        100: '#dcf2dc',
                        200: '#bce5bc',
                        300: '#8fd18f',
                        400: '#5bb55b',
                        500: '#389738',
                        600: '#2a7a2a',
                        700: '#236223',
                        800: '#1f4f1f',
                        900: '#1a421a',
                      },
                      'hoja-orange': {
                        50: '#fef7f0',
                        100: '#fdeee0',
                        200: '#f9d5bf',
                        300: '#f4b993',
                        400: '#ed8f5e',
                        500: '#e67332',
                        600: '#d75b28',
                        700: '#b34925',
                        800: '#8f3c25',
                        900: '#743223',
                      }
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>
      <body 
        className={`${inter.variable} ${playfair.variable} antialiased`} 
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}