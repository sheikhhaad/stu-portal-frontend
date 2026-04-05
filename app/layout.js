import { StudentProvider } from "./context/StudentContext";
import { QueryProvider } from "./context/QueryContext";
import { EnrollMentProvider } from "./context/TeacherEnroll";
import { ChatProvider } from "./context/ChatContext";
import "./globals.css";

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
                  {children}
                </ChatProvider>
              </QueryProvider>
          </EnrollMentProvider>
        </StudentProvider>
      </body>
    </html>
  );
}
