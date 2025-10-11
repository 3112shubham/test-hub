import "./globals.css";
import Navbar from "../app/components/Navbar"

export const metadata = {
  title: "Role-Based App",
  description: "Next.js + Firebase Auth Role Routing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen max-w-full flex items-center justify-center">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
