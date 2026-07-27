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
      gap: "var(--space-3)",
    }}>
      {/* Header skeleton */}
      <div style={{
        height: 80,
        borderRadius: "var(--radius-xl)",
        background: "linear-gradient(90deg, var(--muted) 25%, var(--surface) 50%, var(--muted) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
        opacity: 0.6,
      }} />

      {/* Cards skeleton grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "var(--space-3)",
      }}>
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            style={{
              height: 180,
              borderRadius: "var(--radius-xl)",
              background: "linear-gradient(90deg, var(--muted) 25%, var(--surface) 50%, var(--muted) 75%)",
              backgroundSize: "200% 100%",
              animation: `shimmer 1.6s ease-in-out ${n * 0.1}s infinite`,
              opacity: 0.45,
            }}
          />
        ))}
      </div>

      {/* Timeline skeleton */}
      <div style={{
        height: 160,
        borderRadius: "var(--radius-xl)",
        background: "linear-gradient(90deg, var(--muted) 25%, var(--surface) 50%, var(--muted) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s ease-in-out 0.5s infinite",
        opacity: 0.35,
      }} />

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}
