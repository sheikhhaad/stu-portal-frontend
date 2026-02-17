import Navbar from "@/component/Navbar";
import "./globals.css";
import { StudentProvider } from "@/app/context/StudentContext";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <StudentProvider>
          <Navbar />
          {children}
        </StudentProvider>
      </body>
    </html>
  );
}
