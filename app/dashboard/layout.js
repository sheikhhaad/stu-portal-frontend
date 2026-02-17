import Navbar from "@/component/Navbar";
import { StudentProvider } from "../context/StudentContext";
import "../../app/globals.css";


export default function Layout({ children }) {
  return (
   <div>
        <StudentProvider>
          <Navbar />
          {children}
        </StudentProvider>
      </div>
  );
}
