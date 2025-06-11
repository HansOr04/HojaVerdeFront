import type { Metadata } from "next";
import { AuthProvider } from "../../src/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "HojaVerde - Sistema de Asistencia",
  description: "Sistema de gestión de asistencia para empleados agrícolas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}