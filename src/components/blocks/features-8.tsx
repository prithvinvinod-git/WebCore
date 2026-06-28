import { Card, CardContent } from '@/components/ui/card'
import { Gauge, BarChart3 } from 'lucide-react'

const cardAnimation = "opacity-0 animate-fade-in-up"

const delays = [
  "animation-delay-[0ms]",
  "animation-delay-[100ms]",
  "animation-delay-[200ms]",
  "animation-delay-[300ms]",
  "animation-delay-[400ms]",
]

function BarChart() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
      <rect x="10" y="55" width="22" height="40" rx="3" className="fill-[#ea580c] opacity-80" style={{ animation: "bar-rise 0.8s ease-out 0.1s forwards", transformOrigin: "bottom", transform: "scaleY(0)" }} />
      <rect x="38" y="40" width="22" height="55" rx="3" className="fill-[#ea580c]" style={{ animation: "bar-rise 0.8s ease-out 0.2s forwards", transformOrigin: "bottom", transform: "scaleY(0)" }} />
      <rect x="66" y="30" width="22" height="65" rx="3" className="fill-[#16a34a] opacity-80" style={{ animation: "bar-rise 0.8s ease-out 0.3s forwards", transformOrigin: "bottom", transform: "scaleY(0)" }} />
      <rect x="94" y="20" width="22" height="75" rx="3" className="fill-[#16a34a]" style={{ animation: "bar-rise 0.8s ease-out 0.4s forwards", transformOrigin: "bottom", transform: "scaleY(0)" }} />
      <rect x="122" y="35" width="22" height="60" rx="3" className="fill-[#3b82f6] opacity-80" style={{ animation: "bar-rise 0.8s ease-out 0.5s forwards", transformOrigin: "bottom", transform: "scaleY(0)" }} />
      <rect x="150" y="15" width="22" height="80" rx="3" className="fill-[#3b82f6]" style={{ animation: "bar-rise 0.8s ease-out 0.6s forwards", transformOrigin: "bottom", transform: "scaleY(0)" }} />
    </svg>
  )
}

function LineChart() {
  const points = "0,80 30,65 60,70 90,40 120,45 150,20 180,25"
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${points} L180,95 L0,95 Z`} fill="url(#lineGrad)" />
      <path d={`M${points}`} stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line" strokeDasharray="400" strokeDashoffset="400" />
      {["0,80", "30,65", "60,70", "90,40", "120,45", "150,20"].map((p, i) => (
        <circle key={i} cx={+p.split(",")[0]} cy={+p.split(",")[1]} r="3" fill="#16a34a" className="opacity-0 animate-fade-in" style={{ animationDelay: `${1 + i * 0.1}s` }} />
      ))}
      <circle cx="180" cy="25" r="4" fill="#16a34a" stroke="#fff" strokeWidth="2" className="opacity-0 animate-fade-in" style={{ animationDelay: "1.6s" }} />
    </svg>
  )
}

function RadarChart() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
      {[3, 2, 1].map((n) => {
        const r = n * 18
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI * 2 * i) / 6 - Math.PI / 2
          return `${60 + Math.cos(a) * r},${60 + Math.sin(a) * r}`
        }).join(" ")
        return <polygon key={n} points={pts} stroke="#e5e5e5" strokeWidth="1" fill="none" />
      })}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (Math.PI * 2 * i) / 6 - Math.PI / 2
        return <line key={i} x1="60" y1="60" x2={60 + Math.cos(a) * 54} y2={60 + Math.sin(a) * 54} stroke="#e5e5e5" strokeWidth="1" />
      })}
      <polygon
        points="60,12 102,40 102,80 60,108 18,80 18,40"
        fill="#3b82f6"
        fillOpacity="0.15"
        stroke="#3b82f6"
        strokeWidth="2"
        className="animate-fade-in"
        style={{ animationDelay: "0.3s" }}
      />
      <polygon
        points="60,24 90,42 85,75 60,90 35,75 30,42"
        fill="#ea580c"
        fillOpacity="0.12"
        stroke="#ea580c"
        strokeWidth="2"
        className="animate-fade-in"
        style={{ animationDelay: "0.6s" }}
      />
    </svg>
  )
}

function AreaChart() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ea580c" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,85 Q25,78 50,75 T100,60 T150,35 T200,30 L200,98 L0,98 Z" fill="url(#areaGrad)" />
      <path d="M0,85 Q25,78 50,75 T100,60 T150,35 T200,30" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" className="animate-draw-line" strokeDasharray="500" strokeDashoffset="500" />
      <path d="M0,60 Q25,55 50,50 T100,40 T150,25 T200,15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity="0.6" className="animate-draw-line" strokeDasharray="500" strokeDashoffset="500" style={{ animationDelay: "0.5s" }} />
      <path d="M0,75 Q25,70 50,65 T100,55 T150,40 T200,35" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" opacity="0.5" className="animate-draw-line" strokeDasharray="500" strokeDashoffset="500" style={{ animationDelay: "1s" }} />
    </svg>
  )
}

export function Features() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-3xl lg:max-w-5xl px-6">
        <div className="relative">
          <div className="relative z-10 grid grid-cols-6 gap-3">
            <Card className={`relative col-span-full flex overflow-hidden lg:col-span-2 ${cardAnimation} ${delays[0]}`}>
              <CardContent className="relative m-auto size-fit pt-6 w-full">
                <div className="relative h-28 w-full px-4">
                  <BarChart />
                </div>
                <h2 className="mt-4 text-center text-xl font-semibold text-[#0a0a0a]">150+ Security Checks</h2>
                <p className="mt-1 text-center text-sm text-[#7a7676] px-2 pb-4">
                  CVE scanning, TLS config, secret leak detection, and more
                </p>
              </CardContent>
            </Card>

            <Card className={`relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 ${cardAnimation} ${delays[1]}`}>
              <CardContent className="pt-6">
                <div className="relative mx-auto size-32">
                  <RadarChart />
                </div>
                <div className="relative z-10 mt-4 space-y-2 text-center px-2 pb-4">
                  <h2 className="text-lg font-medium text-[#0a0a0a]">Domain Health</h2>
                  <p className="text-sm text-[#7a7676]">DNS records, email security, SSL certs, redirect chains</p>
                </div>
              </CardContent>
            </Card>

            <Card className={`relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 ${cardAnimation} ${delays[2]}`}>
              <CardContent className="pt-6">
                <div className="pt-2 px-2 h-28">
                  <LineChart />
                </div>
                <div className="relative z-10 mt-6 space-y-2 text-center px-2 pb-4">
                  <h2 className="text-lg font-medium text-[#0a0a0a]">SEO &amp; AEO</h2>
                  <p className="text-sm text-[#7a7676]">80+ SEO checks, 60+ AEO checks, AI crawler analysis</p>
                </div>
              </CardContent>
            </Card>

            <Card className={`relative col-span-full overflow-hidden lg:col-span-3 ${cardAnimation} ${delays[3]}`}>
              <CardContent className="grid pt-6 sm:grid-cols-2 gap-4">
                <div className="relative z-10 flex flex-col justify-between">
                  <div className="relative flex size-10 rounded-full border border-[#e5e5e5] items-center justify-center">
                    <Gauge size={18} className="text-[#ea580c]" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2 mt-4">
                    <h2 className="text-lg font-medium text-[#0a0a0a]">Performance Metrics</h2>
                    <p className="text-sm text-[#7a7676]">Core Web Vitals, load time breakdown, optimization scores</p>
                  </div>
                </div>
                <div className="relative h-32 sm:h-full min-h-[100px]">
                  <AreaChart />
                </div>
              </CardContent>
            </Card>

            <Card className={`relative col-span-full overflow-hidden lg:col-span-3 ${cardAnimation} ${delays[4]}`}>
              <CardContent className="grid h-full pt-6 sm:grid-cols-2 gap-4">
                <div className="relative z-10 flex flex-col justify-between">
                  <div className="relative flex size-10 rounded-full border border-[#e5e5e5] items-center justify-center">
                    <BarChart3 size={18} className="text-[#7c3aed]" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2 mt-4">
                    <h2 className="text-lg font-medium text-[#0a0a0a]">AI Readiness</h2>
                    <p className="text-sm text-[#7a7676]">LLM-friendliness, voice search, machine readability</p>
                  </div>
                </div>
                <div className="relative flex flex-col justify-center space-y-3 py-4">
                  {[
                    { label: "LLM Friendly", value: "98%", color: "bg-[#16a34a]" },
                    { label: "Voice Ready", value: "92%", color: "bg-[#3b82f6]" },
                    { label: "Machine Readable", value: "95%", color: "bg-[#7c3aed]" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 justify-end">
                      <span className="text-xs text-[#7a7676] font-medium">{item.label}</span>
                      <div className={`size-7 rounded-full ${item.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
