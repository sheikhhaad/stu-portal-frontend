import { StudentProvider } from "./context/StudentContext";
import { QueryProvider } from "./context/QueryContext";
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
          <QueryProvider>{children}</QueryProvider>
        </StudentProvider>
      </body>
    </html>
  );
}
