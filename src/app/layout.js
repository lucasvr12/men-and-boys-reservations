import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Men & Boys - Reservaciones",
  description: "Agenda tu cita en nuestras sucursales Men & Boys",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-['Inter',sans-serif] antialiased">
        <header className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center py-2 hover:opacity-80 transition-opacity">
              <img src="/logo.jpg" alt="Men & Boys" className="h-14 md:h-16 w-auto object-contain" />
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/staff" className="text-sm text-gray-400 hover:text-white transition-colors">
                Mi Agenda
              </Link>
              <a href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
                Admin
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
