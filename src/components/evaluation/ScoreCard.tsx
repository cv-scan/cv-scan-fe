import { cn } from '../../utils/cn'

interface ScoreCardProps {
  score: number
  maxScore?: number
  label?: string
  size?: 'sm' | 'lg'
}

function getScoreColor(percentage: number): { bg: string; text: string; ring: string } {
  if (percentage >= 80) return { bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-200' }
  if (percentage >= 60) return { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200' }
  if (percentage >= 40) return { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'ring-yellow-200' }
  return { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-200' }
}

function getScoreLabel(percentage: number): string {
  if (percentage >= 80) return 'Excellent'
  if (percentage >= 60) return 'Good'
  if (percentage >= 40) return 'Fair'
  return 'Poor'
}

export function ScoreCard({ score, maxScore = 100, label, size = 'lg' }: ScoreCardProps) {
  const percentage = Math.round((score / maxScore) * 100)
  const colors = getScoreColor(percentage)

  return (
    <div className={cn('flex flex-col items-center gap-2')}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full ring-4',
          colors.bg,
          colors.ring,
          size === 'lg' ? 'h-32 w-32' : 'h-20 w-20'
        )}
      >
        <div className="text-center">
          <div className={cn('font-bold', colors.text, size === 'lg' ? 'text-4xl' : 'text-2xl')}>
            {percentage}
          </div>
          <div className={cn('text-xs', colors.text)}>/ 100</div>
        </div>
      </div>
      <div className="text-center">
        <div className={cn('font-semibold', colors.text)}>{getScoreLabel(percentage)}</div>
        {label && <div className="text-xs text-gray-500">{label}</div>}
      </div>
    </div>
  )
}
