import { cn } from '../../utils/cn'

interface ScoreBarProps {
  label: string
  score: number
  maxScore?: number
  className?: string
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-blue-500'
  if (percentage >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function ScoreBar({ label, score, maxScore = 100, className }: ScoreBarProps) {
  const percentage = Math.round((score / maxScore) * 100)

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{score}/{maxScore}</span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getScoreColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
