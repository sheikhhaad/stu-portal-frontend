import { StudentProvider } from "./context/StudentContext";
import { QueryProvider } from "./context/QueryContext";
import { EnrollMentProvider } from "./context/TeacherEnroll";
import { ChatProvider } from "./context/ChatContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Toaster } from "react-hot-toast";
import Script from "next/script"; // ← import Next.js Script
import "./globals.css";

export const metadata = {
  title: "Student Portal",
  description: "Professional student query portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Load Jitsi API globally */}
        <Script
          src="https://meet.jit.si/external_api.js"
          strategy="beforeInteractive" // or "lazyOnload" if not needed immediately
        />

        <StudentProvider>
          <EnrollMentProvider>
            <QueryProvider>
              <ChatProvider>
                <NotificationProvider>
                  <Toaster position="top-right" />
                  {children}
                </NotificationProvider>
              </ChatProvider>
            </QueryProvider>
          </EnrollMentProvider>
        </StudentProvider>
      </body>
    </html>
  );
}
