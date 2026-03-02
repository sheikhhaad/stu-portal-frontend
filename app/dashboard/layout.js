import Navbar from "@/component/Navbar";
import { StudentProvider } from "../context/StudentContext";
import { QueryProvider } from "../context/QueryContext";
import "../../app/globals.css";

export default function Layout({ children }) {
  return (
    <div>
      <StudentProvider>
        <QueryProvider>
          <Navbar />
          {children}
        </QueryProvider>
      </StudentProvider>
    </div>
  );
}
