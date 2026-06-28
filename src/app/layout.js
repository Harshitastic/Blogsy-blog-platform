import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";

export const metadata = {
  title: "Blogsy — Immersive Minimalist Blog",
  description: "A sleek, clean blogging platform built with Next.js, SQLite & Prisma.",
};

// Inline SVG GithubIcon for older lucide compatibility
function GithubIcon({ size = 16, ...props }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Header />
              <div className="container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
              </div>
              <footer className="main-footer">
                <div className="container footer-container">
                  <span>&copy; {new Date().getFullYear()} Blogsy.</span>
                  <a 
                    href="https://github.com/harshitastic" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="footer-github-link"
                  >
                    <GithubIcon size={16} />
                    <span>harshitastic</span>
                  </a>
                </div>
              </footer>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
