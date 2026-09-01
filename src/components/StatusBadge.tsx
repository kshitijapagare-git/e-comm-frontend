const TONES: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
  paid: 'info',
  shipped: 'success',
  cancelled: 'danger',
}

export function StatusBadge({ status }: { status: string }) {
  const tone = TONES[status] ?? 'neutral'
  return <span className={`badge badge-${tone}`}>{status}</span>
}
