import { cn } from "../lib/cn"
import type { ReactNode } from "react"

export type PillarTone = "amber" | "cobalt" | "emerald"

export interface PillarProps {
  num: string
  title: ReactNode
  body: ReactNode
  items?: string[]
  icon?: ReactNode
  tone?: PillarTone
}

export const Pillar = ({
  num,
  title,
  body,
  items,
  icon,
  tone = "amber",
}: PillarProps) => {
  return (
    <article
      className={cn(
        "dx-pillar",
        tone === "cobalt" && "dx-pillar--cobalt",
        tone === "emerald" && "dx-pillar--emerald"
      )}
    >
      {icon ? <div className="dx-pillar__icon">{icon}</div> : null}
      <div className="dx-pillar__num">PILLAR {num}</div>
      <h3 className="dx-pillar__title">
        {title}
        <span className="x">.</span>
      </h3>
      <p className="dx-pillar__body">{body}</p>
      {items && items.length > 0 ? (
        <ul className="dx-pillar__list">
          {items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
