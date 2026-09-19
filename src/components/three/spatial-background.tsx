'use client';

/* Seamless coffee-bean pattern — non-parallel, scattered beans like the
 * Pinterest "coffee bean scatter" café wallpapers. The texture itself drifts
 * very slowly ("flow") so the wall breathes — no floating objects. */
const BEAN_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%23b98a55' stroke-opacity='0.4'%3E%3Cpath d='M54 120c12-20 36-20 48 0s-6 52-18 52-42-32-30-52z'/%3E%3Cpath d='M78 120c-8 6-4 28-4 38'/%3E%3Cpath d='M128 58c10-18 30-18 40 0s-24 20-40 22-10-8-10-14z'/%3E%3Cg fill='none' stroke='%238a5a33' stroke-opacity='0.32'%3E%3Cpath transform='rotate(140 84 26)' d='M64 12c10-18 30-18 40 0s-24 20-40 22-10-8-10-14z'/%3E%3Cpath d='M94 148c8-12 22-12 30 0s-14 26-30 26-10-16-2-26z'/%3E%3Cg fill='none' stroke='%23b98a55' stroke-opacity='0.28'%3E%3Cpath transform='rotate(-60 130 128)' d='M108 108c10-18 30-18 40 0s-24 20-40 22-10-8-10-14z'/%3E%3Cpath d='M26 126c6-10 16-10 22 0s-8 18-22 18-6-12 0-18z'/%3E%3C/svg%3E")`;

export function SpatialBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Warm gradient base — latte cream to caramel café wall */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #f7f0e3 0%, #f3e8d4 35%, #f0e2c9 65%, #f5ecdb 100%)',
      }} />

      {/* Scattered non-parallel bean pattern — like the Pinterest café wallpapers */}
      <div className="absolute inset-0 bg-repeat bean-flow" style={{
        backgroundImage: BEAN_PATTERN,
        backgroundSize: '180px 180px',
      }} />

      {/* Warm radial glows — ambient café lighting */}
      <div className="cafe-glow glow-1" />
      <div className="cafe-glow glow-2" />
      <div className="cafe-glow glow-3" />

      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: `radial-gradient(rgba(138,90,43,0.5) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }} />

      {/* Soft vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(180,140,90,0.22) 100%)',
      }} />
    </div>
  );
}
