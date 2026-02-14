import { redirect } from "next/navigation";

export default function Home() {
  // For the current phase of the project, the dashboard is the main experience.
  // Redirecting here keeps localhost:3000 aligned with your primary UI.
  // TODO (Later): Once auth is implemented, redirect based on session state
  // (e.g., unauthenticated -> /auth/signin, authenticated -> /dashboard).
  redirect("/dashboard");
}
