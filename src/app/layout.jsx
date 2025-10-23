import "./globals.css";
import Navbar from "../app/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Test Forge",
  description: "Next.js + Firebase Auth Role Routing",
  icons: "/logo.png",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen w-full">
        <Navbar />
        {children}

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 1000,
            style: {
              background: "#fff",
              color: "#333",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              minWidth: "250px", // ensures it won't be too narrow
              maxWidth: "500px", // optional, to prevent it from getting too wide
              whiteSpace: "normal",
            },
          }}
        />
      </body>
    </html>
  );
}
