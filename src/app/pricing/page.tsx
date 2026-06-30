import Link from "next/link"
import { Shield, Check } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    features: ["5 scans/month", "1 monitor", "Basic diagnostics", "Email support"],
    cta: "Get started",
    href: "/auth/signup",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: ["100 scans/month", "10 monitors", "All diagnostics", "AI remediation", "Historical trends", "Priority support"],
    cta: "Start free trial",
    href: "/auth/signup",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    features: ["Unlimited scans", "Unlimited monitors", "Team collaboration", "API access", "Custom webhooks", "SLA guarantee", "Dedicated support"],
    cta: "Contact sales",
    href: "/auth/signup",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <nav className="border-b border-[#e5e5e5] dark:border-neutral-800 bg-white dark:bg-black">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield size={22} className="text-[#0a0a0a] dark:text-white" />
            <span className="font-inter text-base font-semibold text-[#0a0a0a] dark:text-white">WebCore</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/login" className="text-sm font-medium text-[#737373] dark:text-neutral-400 hover:text-[#0a0a0a] dark:hover:text-white">Sign in</Link>
            <Link href="/auth/signup" className="px-4 py-1.5 bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] rounded-full text-sm font-medium">Get started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-[#0a0a0a] dark:text-white">Simple pricing</h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-2">Start free, scale as you grow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border ${plan.popular ? "border-[#0a0a0a] dark:border-white ring-1 ring-[#0a0a0a] dark:ring-white" : "border-[#e5e5e5] dark:border-neutral-800"} bg-white dark:bg-neutral-950 p-6`}
            >
              {plan.popular && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0a0a0a] dark:text-white">Most popular</span>
              )}
              <h2 className="text-lg font-semibold text-[#0a0a0a] dark:text-white mt-1">{plan.name}</h2>
              <div className="mt-4">
                <span className="text-3xl font-bold text-[#0a0a0a] dark:text-white">{plan.price}</span>
                <span className="text-sm text-[#737373] dark:text-neutral-400">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#525252] dark:text-neutral-300">
                    <Check size={14} className="text-[#16a34a]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center mt-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  plan.popular ? "bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#262626] dark:hover:bg-neutral-200" : "border border-[#e5e5e5] dark:border-neutral-700 text-[#0a0a0a] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-neutral-800"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
