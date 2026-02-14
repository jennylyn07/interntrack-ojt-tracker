import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>OJT Tracker</h1>
      <p>Student OJT Tracking System</p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/dashboard">Go to Dashboard</Link>
      </p>
    </main>
  );
}
