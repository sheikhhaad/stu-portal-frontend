import { StudentProvider } from "./context/StudentContext";
import { QueryProvider } from "./context/QueryContext";
import { EnrollMentProvider } from "./context/TeacherEnroll";
import { ChatProvider } from "./context/ChatContext";
import "./globals.css";
import { NotificationProvider } from "./context/NotificationContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Student Portal",
  description: "Professional student query portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
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
