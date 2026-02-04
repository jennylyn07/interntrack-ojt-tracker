import "./globals.css";

export const metadata = {
  title: "OJT Tracker",
  description: "Student OJT Tracking System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

