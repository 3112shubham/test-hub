import "./globals.css";
export const metadata = {
  title: "Role-Based App",
  description: "Next.js + Firebase Auth Role Routing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}
