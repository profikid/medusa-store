import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  KPICard,
  Lockup,
  Pillar,
  Progress,
  Stat,
  Textarea,
} from "../../design-system/components"
import { brand, color } from "../../design-system/tokens"

import "../../design-system/globals.css"

const DistrictXPage = () => {
  return (
    <div className="dx-scope" style={{ padding: 32, maxWidth: 1280, margin: "0 auto" }}>
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 24,
          borderBottom: "1px solid var(--dx-border)",
          marginBottom: 48,
        }}
      >
        <div className="dx-flex dx-gap-3" style={{ alignItems: "center" }}>
          <svg width="36" height="36" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="dx-lineA" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F4B33A" />
                <stop offset="100%" stopColor="#C97A0E" />
              </linearGradient>
              <linearGradient id="dx-lineB" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F9C766" />
                <stop offset="100%" stopColor="#E89A1F" />
              </linearGradient>
            </defs>
            <path d="M14 14 L36 14 L86 86 L64 86 Z" fill="url(#dx-lineA)" />
            <path d="M64 14 L86 14 L36 86 L14 86 Z" fill="url(#dx-lineB)" />
            <path d="M44 36 L66 50 L44 64 Z" fill="#0A0A0A" />
          </svg>
          <span
            style={{
              fontFamily: "var(--dx-font-display)",
              fontWeight: 700,
              letterSpacing: 4,
              fontSize: 16,
            }}
          >
            DISTRICT<span style={{ color: "var(--dx-amber-300)" }}>X</span>
          </span>
        </div>
        <nav className="dx-nav">
          <a href="#philosophy">Philosophy</a>
          <a href="#logo">Logo</a>
          <a href="#color">Color</a>
          <a href="#type">Type</a>
          <a href="#components">Components</a>
          <a href="#data">Data</a>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ marginBottom: 96 }}>
        <div className="dx-grid-2">
          <div>
            <span
              className="dx-eyebrow"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 12px",
                border: "1px solid var(--dx-border-strong)",
                borderRadius: "var(--dx-r-pill)",
                background: "var(--dx-bg-1)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--dx-amber-300)",
                  display: "inline-block",
                }}
              />
              DESIGN STUDIO · v1.0
            </span>
            <h1 className="dx-display-xl dx-mt-5">
              Building
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--dx-amber-100), var(--dx-amber-300))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Intelligent
              </span>
              <br />
              Spaces.
            </h1>
            <p className="dx-body dx-mt-4" style={{ maxWidth: 560 }}>
              {brand.promise} A complete design system for District X: design, systems,
              and the future stitched into one intelligent fabric.
            </p>
            <div className="dx-flex dx-gap-3 dx-mt-5" style={{ flexWrap: "wrap" }}>
              <Button variant="primary">Explore the system →</Button>
              <Button variant="ghost">View logo lockups</Button>
              <Button variant="outline">Download SVG</Button>
            </div>

            <div
              className="dx-grid-3"
              style={{
                marginTop: 48,
                paddingTop: 32,
                borderTop: "1px solid var(--dx-border)",
              }}
            >
              <Stat num="3" lbl="Pillars · Design · Systems · Future" />
              <Stat num="1.0" lbl="FTE · Klein team, grote impact" />
              <Stat num="6+" lbl="Months · Runway built in" />
            </div>
          </div>

          <div
            style={{
              background:
                "linear-gradient(180deg, var(--dx-bg-1) 0%, var(--dx-bg-0) 100%)",
              border: "1px solid var(--dx-border)",
              borderRadius: "var(--dx-r-4)",
              padding: 48,
              position: "relative",
              overflow: "hidden",
              minHeight: 360,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="220" height="220" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <linearGradient id="dx-heroA" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F4B33A" />
                  <stop offset="100%" stopColor="#C97A0E" />
                </linearGradient>
                <linearGradient id="dx-heroB" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F9C766" />
                  <stop offset="100%" stopColor="#E89A1F" />
                </linearGradient>
              </defs>
              <path d="M14 14 L36 14 L86 86 L64 86 Z" fill="url(#dx-heroA)" />
              <path d="M64 14 L86 14 L36 86 L14 86 Z" fill="url(#dx-heroB)" />
              <path d="M44 36 L66 50 L44 64 Z" fill="#0A0A0A" />
            </svg>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="philosophy" style={{ marginBottom: 96 }}>
        <div className="dx-eyebrow">01 · PHILOSOPHY</div>
        <h2 className="dx-title">Three pillars, one fabric.</h2>
        <p className="dx-body" style={{ maxWidth: 720 }}>
          District X is a working method, not just a brand. Every artifact in this system
          maps back to one of three commitments. When in doubt, ask which pillar you're
          serving.
        </p>

        <div className="dx-grid-3 dx-mt-6">
          <Pillar
            num="01"
            tone="amber"
            title="Smart Design"
            body="Form follows intent. Interfaces are quiet, typography-led, and built on a 4pt grid. Every pixel earns its place."
            items={[
              "Clarity over cleverness",
              "Type that does the talking",
              "Restraint is a feature",
            ]}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M15.5 8.5 L13 13 L8.5 15.5 L11 11 Z" />
              </svg>
            }
          />
          <Pillar
            num="02"
            tone="cobalt"
            title="Smart Systems"
            body="Components, tokens, and APIs that compose. The same building blocks power the dashboard, the partner portal, and the next product."
            items={[
              "Tokens before pages",
              "One system, many surfaces",
              "API-first, always",
            ]}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="3" />
                <circle cx="4" cy="6" r="2" />
                <circle cx="20" cy="6" r="2" />
                <circle cx="4" cy="18" r="2" />
                <circle cx="20" cy="18" r="2" />
              </svg>
            }
          />
          <Pillar
            num="03"
            tone="emerald"
            title="Smart Future"
            body="We measure in compounding advantages. Every sprint should leave the system stronger than we found it."
            items={[
              "Bouw vandaag voor morgen",
              "AI is een collega, geen gimmick",
              "Runway is a design constraint",
            ]}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 17 L9 11 L13 15 L21 7" />
                <path d="M15 7 L21 7 L21 13" />
              </svg>
            }
          />
        </div>

        <div className="dx-quote dx-mt-7">
          <p className="dx-quote__text">
            We don't just build technology.
            <br />
            We build the <em>future of living</em>.
          </p>
          <div className="dx-quote__attr">— District X · Brand promise</div>
        </div>
      </section>

      {/* Logo */}
      <section id="logo" style={{ marginBottom: 96 }}>
        <div className="dx-eyebrow">02 · LOGO & MARKS</div>
        <h2 className="dx-title">The X that goes forward.</h2>
        <div className="dx-grid-3 dx-mt-6">
          <Lockup variant="dark" label="PRIMARY · DARK" />
          <Lockup variant="light" label="PRIMARY · LIGHT" />
          <Lockup variant="amber" label="REVERSED · AMBER" />
        </div>
      </section>

      {/* Color */}
      <section id="color" style={{ marginBottom: 96 }}>
        <div className="dx-eyebrow">03 · COLOR</div>
        <h2 className="dx-title">Black. Amber. A single thread of intent.</h2>
        <p className="dx-body" style={{ maxWidth: 720 }}>
          Most of the system is negative space. Amber is the only color that carries
          meaning. Blue and green are used sparingly to mark the second and third pillars.
        </p>

        <div className="dx-grid-3 dx-mt-6">
          {Object.entries(color.surface).map(([name, value]) => (
            <div key={name} className="dx-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ height: 110, background: value }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>DX {name}</div>
                <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-text-60)" }}>
                  --dx-surface.{name}
                </div>
              </div>
            </div>
          ))}
          {Object.entries(color.text)
            .filter(([k]) => ["hundred", "sixty", "forty"].includes(k))
            .map(([name, value]) => (
              <div key={name} className="dx-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ height: 110, background: value }} />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>DX text {name}</div>
                  <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-text-60)" }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          {Object.entries(color.amber).map(([name, value]) =>
            typeof value === "string" && !name.includes("glow") ? (
              <div key={name} className="dx-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ height: 110, background: value }} />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Amber {name}</div>
                  <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-text-60)" }}>
                    {value}
                  </div>
                </div>
              </div>
            ) : null
          )}
          <div className="dx-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ height: 110, background: color.supporting.cobalt }} />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Cobalt · Systems</div>
              <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-text-60)" }}>
                {color.supporting.cobalt}
              </div>
            </div>
          </div>
          <div className="dx-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ height: 110, background: color.supporting.emerald }} />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Emerald · Future</div>
              <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-text-60)" }}>
                {color.supporting.emerald}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Type */}
      <section id="type" style={{ marginBottom: 96 }}>
        <div className="dx-eyebrow">04 · TYPOGRAPHY</div>
        <h2 className="dx-title">One display, one workhorse, one mono.</h2>

        <Card className="dx-mt-6">
          <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-amber-300)" }}>
            DISPLAY · XL
          </div>
          <div className="dx-display-xl dx-mt-2">Building intelligent spaces.</div>
          <div className="dx-mono dx-mt-3" style={{ fontSize: 11, color: "var(--dx-text-40)" }}>
            Space Grotesk 56/56 · 700
          </div>

          <div className="dx-deco-line dx-mt-6" />

          <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-amber-300)" }}>
            DISPLAY · LG
          </div>
          <div className="dx-display-lg dx-mt-2">A design studio for the next decade.</div>

          <div className="dx-deco-line dx-mt-6" />

          <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-amber-300)" }}>
            BODY
          </div>
          <p className="dx-body dx-mt-2">
            We bundle products, processes, and partners into one slim ecosystem. The
            dashboard you are reading is itself a product of that ecosystem.
          </p>

          <div className="dx-deco-line dx-mt-6" />

          <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-amber-300)" }}>
            MONO
          </div>
          <div className="dx-mono dx-mt-2">$ district-x ship --design-system</div>
        </Card>
      </section>

      {/* Components */}
      <section id="components" style={{ marginBottom: 96 }}>
        <div className="dx-eyebrow">05 · COMPONENTS</div>
        <h2 className="dx-title">Buttons, badges, cards, inputs.</h2>

        <div className="dx-grid-2 dx-mt-6">
          <Card>
            <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-amber-300)" }}>
              BUTTONS
            </div>
            <div className="dx-flex dx-gap-3 dx-mt-3" style={{ flexWrap: "wrap" }}>
              <Button variant="primary">Primary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </Card>

          <Card>
            <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-amber-300)" }}>
              BADGES
            </div>
            <div className="dx-flex dx-gap-3 dx-mt-3" style={{ flexWrap: "wrap" }}>
              <Badge>Default</Badge>
              <Badge variant="amber" dot>Brand</Badge>
              <Badge variant="success" dot>Success</Badge>
              <Badge variant="info" dot>Info</Badge>
              <Badge variant="warn" dot>Warning</Badge>
            </div>
          </Card>

          <Card>
            <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-amber-300)" }}>
              INPUTS
            </div>
            <div className="dx-mt-3">
              <Input label="Product name" placeholder="DX Smart Lamp" />
              <div className="dx-mt-3">
                <Textarea label="Description" placeholder="..." rows={3} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="dx-mono" style={{ fontSize: 11, color: "var(--dx-amber-300)" }}>
              PROGRESS
            </div>
            <div className="dx-mt-3">
              <Progress value={72} label="Cobalt sync" />
              <div className="dx-mt-3">
                <Progress value={48} label="Future runway" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Data */}
      <section id="data" style={{ marginBottom: 96 }}>
        <div className="dx-eyebrow">06 · DATA</div>
        <h2 className="dx-title">KPI cards, sample table.</h2>

        <div className="dx-grid-4 dx-mt-6">
          <KPICard label="Mrr" value="€ 12.4K" sub="+18% m/m" />
          <KPICard label="Orders" value="342" sub="7d window" />
          <KPICard label="Runway" value="6.2 mo" sub="burn €6.7K/m" />
          <KPICard label="Active SKUs" value="58" sub="of 64" />
        </div>

        <Card className="dx-mt-6" style={{ padding: 0 }}>
          <table className="dx-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="dx-mono">#ORD-1042</td>
                <td>Lina Bakker</td>
                <td>
                  <Badge variant="success" dot>
                    paid
                  </Badge>
                </td>
                <td className="dx-mono">€ 248.00</td>
              </tr>
              <tr>
                <td className="dx-mono">#ORD-1043</td>
                <td>Jasper V.</td>
                <td>
                  <Badge variant="info" dot>
                    fulfillment
                  </Badge>
                </td>
                <td className="dx-mono">€ 1,420.00</td>
              </tr>
              <tr>
                <td className="dx-mono">#ORD-1044</td>
                <td>Nadia P.</td>
                <td>
                  <Badge variant="warn" dot>
                    pending
                  </Badge>
                </td>
                <td className="dx-mono">€ 89.00</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--dx-border)",
          padding: "48px 0",
          color: "var(--dx-text-60)",
          fontSize: 13,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--dx-font-display)",
              fontWeight: 700,
              letterSpacing: 4,
              color: "var(--dx-text-100)",
            }}
          >
            DISTRICT<span style={{ color: "var(--dx-amber-300)" }}>X</span>
          </span>
          <span className="dx-mono dx-mt-2" style={{ display: "block", marginTop: 8 }}>
            {brand.tagline}
          </span>
        </div>
        <div className="dx-flex dx-gap-3" style={{ alignItems: "center" }}>
          <Avatar initials="DX" />
          <div>
            <div style={{ color: "var(--dx-text-100)" }}>One team, one fabric.</div>
            <div className="dx-caption">Smart Design · Smart Systems · Smart Future</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "District X Design System",
})

export default DistrictXPage
