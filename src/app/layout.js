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
            <div className="flex items-center gap-2">
              {/* Logo Placeholder */}
              <div className="w-10 h-10 bg-mbRed rounded flex items-center justify-center font-['Oswald'] font-bold text-xl text-white">
                M&B
              </div>
              <span className="font-['Oswald'] font-bold text-2xl tracking-wider">
                MEN<span className="text-mbRed">&</span>BOYS
              </span>
            </div>
            <nav>
              <a href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
                Staff
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
