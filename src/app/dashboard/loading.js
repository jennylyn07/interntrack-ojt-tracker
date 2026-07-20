// File: src/app/dashboard/loading.js
// Purpose: Loading skeleton shown automatically by Next.js App Router
// while the dashboard server component fetches its data.
//
// Next.js shows this file instantly, before the async DashboardPage
// component resolves — so the user sees something rather than a blank screen.

export default function DashboardLoading() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      animation: "pulse 1.8s ease-in-out infinite",
    }}>
      {/* Header skeleton */}
      <div style={{
        height: 80,
        borderRadius: "var(--radius-lg)",
        background: "var(--muted)",
        opacity: 0.5,
      }} />

      {/* Cards skeleton grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.5rem",
      }}>
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            style={{
              height: 180,
              borderRadius: "var(--radius-lg)",
              background: "var(--muted)",
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Timeline skeleton */}
      <div style={{
        height: 160,
        borderRadius: "var(--radius-lg)",
        background: "var(--muted)",
        opacity: 0.3,
      }} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
