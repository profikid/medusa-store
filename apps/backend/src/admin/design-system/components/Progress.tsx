export interface ProgressProps {
  /** 0..100 */
  value: number
  label?: string
}

export const Progress = ({ value, label }: ProgressProps) => {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div>
      {label ? <div className="dx-caption dx-mt-2">{label}</div> : null}
      <div className="dx-meter">
        <div className="dx-meter__fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
