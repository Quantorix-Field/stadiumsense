import type { CrowdLevel } from '../types'
import { crowdLevelColor, formatCrowdLevel } from '../utils/formatters'

interface CrowdMeterProps {
  level: CrowdLevel
  score: number
}

/**
 * Compact visual bar showing crowd density. Uses both color and text label
 * together (never color alone) so the meaning still comes through for
 * colorblind users or on low-contrast outdoor screens.
 */
export function CrowdMeter({ level, score }: CrowdMeterProps) {
  const color = crowdLevelColor(level)
  const label = formatCrowdLevel(level)

  return (
    <div
      className="crowd-meter"
      role="img"
      aria-label={`Crowd level: ${label}, ${score} out of 100`}
    >
      <div className="crowd-meter-track">
        <div
          className="crowd-meter-fill"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="crowd-meter-label" style={{ color }}>
        {label}
      </span>
    </div>
  )
}
