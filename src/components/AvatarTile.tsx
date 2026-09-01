const PALETTE = ['#4f46e5', '#0ea5e9', '#d97706', '#16a34a', '#db2777', '#7c3aed']

function colorFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function initialsFor(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

interface AvatarTileProps {
  label: string
  shape?: 'circle' | 'square'
}

export function AvatarTile({ label, shape = 'circle' }: AvatarTileProps) {
  return (
    <span
      className={`avatar-tile avatar-tile-${shape}`}
      style={{ background: colorFor(label) }}
      aria-hidden="true"
    >
      {initialsFor(label)}
    </span>
  )
}
