import { StudentProvider } from "./context/StudentContext";
import { QueryProvider } from "./context/QueryContext";
import { EnrollMentProvider } from "./context/TeacherEnroll";
import { ChatProvider } from "./context/ChatContext";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationContainer from "@/component/NotificationContainer";
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
          <NotificationProvider>
            <EnrollMentProvider>
              <QueryProvider>
                <ChatProvider>
                  {children}
                  <NotificationContainer />
                </ChatProvider>
              </QueryProvider>
            </EnrollMentProvider>
          </NotificationProvider>
        </StudentProvider>
      </body>
    </html>
  );
}
