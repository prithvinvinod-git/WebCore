import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getGrade } from "@/lib/constants"

interface ScoreCardProps {
  label: string
  score: number
  accentColor: string
  className?: string
}

export function ScoreCard({ label, score, accentColor, className }: ScoreCardProps) {
  const { grade } = getGrade(score)
  return (
    <Card className={cn("min-w-[140px]", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#737373] font-medium uppercase tracking-wide">
            {label}
          </span>
          <span
            className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {grade}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-medium" style={{ color: accentColor }}>
            {score}
          </span>
          <span className="text-sm text-[#737373]">/ 100</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, backgroundColor: accentColor }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
