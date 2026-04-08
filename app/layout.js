import { StudentProvider } from "./context/StudentContext";
import { QueryProvider } from "./context/QueryContext";
import { EnrollMentProvider } from "./context/TeacherEnroll";
import { ChatProvider } from "./context/ChatContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Student Portal",
  description: "Professional student query portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
         <Script
          src='https://8x8.vc/vpaas-magic-cookie-dcf276331a0c4225821d9c60bd0aeb93/external_api.js'
          strategy="lazyOnload"
          async
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
