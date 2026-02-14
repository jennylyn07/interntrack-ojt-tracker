import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "OJT Tracker",
  description: "Student OJT Tracking System",
};

export default function RootLayout({ children }) {
  // Teaching note:
  // RootLayout is a server component. We can still embed a tiny inline script
  // that runs before React hydrates, to apply the persisted theme and avoid a
  // “flash” where the page briefly shows the wrong theme.
  const themeInitScript = `(() => {
    try {
      const key = "ojt-theme";
      const stored = localStorage.getItem(key);
      const system = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      const theme = stored === "dark" || stored === "light" ? stored : system;
      document.documentElement.dataset.theme = theme;
    } catch (e) {
      // If localStorage is unavailable, we simply fall back to the default CSS.
    }
  })();`;

  return (
    <html lang="en">
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
