import { cn } from '../../utils/cn'

interface ScoreCardProps {
  score: number
  maxScore?: number
  label?: string
  size?: 'sm' | 'lg'
}

function getScoreColor(percentage: number): { bg: string; text: string; ring: string; track: string } {
  if (percentage >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200', track: 'stroke-emerald-500' }
  if (percentage >= 60) return { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-200', track: 'stroke-sky-500' }
  if (percentage >= 40) return { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200', track: 'stroke-amber-500' }
  return { bg: 'bg-red-50', text: 'text-red-500', ring: 'ring-red-200', track: 'stroke-red-500' }
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

  // SVG circle progress
  const radius = size === 'lg' ? 52 : 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('flex flex-col items-center gap-2')}>
      <div className="relative">
        <svg
          width={size === 'lg' ? 140 : 90}
          height={size === 'lg' ? 140 : 90}
          className="-rotate-90"
        >
          <circle
            cx={size === 'lg' ? 70 : 45}
            cy={size === 'lg' ? 70 : 45}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={size === 'lg' ? 8 : 6}
            className="text-gray-100"
          />
          <circle
            cx={size === 'lg' ? 70 : 45}
            cy={size === 'lg' ? 70 : 45}
            r={radius}
            fill="none"
            strokeWidth={size === 'lg' ? 8 : 6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-700 ease-out', colors.track)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={cn('font-bold tabular-nums', colors.text, size === 'lg' ? 'text-4xl' : 'text-2xl')}>
              {percentage}
            </div>
            <div className={cn('text-xs font-medium', colors.text, 'opacity-70')}>/ 100</div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className={cn('font-semibold text-sm', colors.text)}>{getScoreLabel(percentage)}</div>
        {label && <div className="text-xs text-gray-400 mt-0.5">{label}</div>}
      </div>
    </div>
  )
}
