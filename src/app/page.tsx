import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Features } from "@/components/blocks/features-8"
import { Footer } from "@/components/layout/footer"
import DotField from "@/components/ui/dot-field"
import ShinyText from "@/components/ui/ShinyText"
import CurvedLoop from "@/components/ui/CurvedLoop"
import Strands from "@/components/ui/Strands"
import { DocsSection } from "@/components/blocks/docs-section"
import DashboardPreview from "@/components/ui/dashboard-preview"
import LandingNav from "@/components/layout/landing-nav"
import { getSession } from "@/lib/session"
import { getScans } from "@/lib/firestore-service"

export default async function Home() {
  const session = await getSession()
  let recentScans = undefined
  if (session?.uid) {
    try { recentScans = await getScans(5, session.uid) } catch {}
  }
  return (
    <div className="flex flex-col flex-1">
      <div className="absolute -z-20" style={{ top: '-310px', left: '-30px', width: '100%', height: '100vh' }}>
        <Strands
          colors={["#F97316","#7C3AED","#06B6D4"]}
          count={3}
          speed={0.5}
          amplitude={1}
          waviness={1}
          thickness={0.7}
          glow={2.6}
          taper={3}
          spread={1}
          intensity={0.6}
          saturation={1.5}
          opacity={0.3}
          scale={1.5}
        />
      </div>
      <LandingNav session={session} />

      <main className="flex-1">
        <section className="relative w-full px-6 py-20 sm:py-32 text-center min-h-screen flex flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <DotField
              dotRadius={2}
              dotSpacing={16}
              bulgeStrength={80}
              glowRadius={0}
              sparkle={false}
              waveAmplitude={0}
              gradientFrom="rgba(124, 58, 237, 0.65)"
              gradientTo="rgba(124, 58, 237, 0.15)"
              glowColor="rgba(124, 58, 237, 0)"
            />
          </div>

          <div className="h-14" />

          <h1 className="font-nasalization text-[48px] sm:text-[72px] font-medium tracking-tight max-w-4xl mx-auto leading-[1.1]">
            <span className="animate-fade-in-up [animation-delay:0.1s] block">
              <ShinyText text="Your Website's Complete" color="#0a0a0a" shineColor="#8A2BE2" speed={3} spread={150} />
            </span>
            <span className="animate-fade-in-up [animation-delay:0.3s] block">
              <ShinyText text="Diagnostic Brain" color="#0a0a0a" shineColor="#8A2BE2" speed={3} spread={150} />
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#7a7676] max-w-2xl mx-auto mt-4 leading-relaxed">
            Security, Visibility, Performance, AI Readiness — all in one scan.
            Enter any URL and get a comprehensive diagnostic report in seconds.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/dashboard/new">
              <Button size="lg" className="bg-[#8A2BE2] hover:bg-[#7B2D8E]">Scan Your Website</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg">
                View Dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-16 mx-auto max-w-4xl w-full rounded-xl border border-[#e5e5e5] bg-white/90 backdrop-blur-sm overflow-hidden shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#e5e5e5] bg-white/80">
              <span className="size-2 rounded-full bg-[#e5e5e5]" />
              <span className="size-2 rounded-full bg-[#e5e5e5]" />
              <span className="size-2 rounded-full bg-[#e5e5e5]" />
              <span className="ml-2 text-xs text-[#7a7676] font-mono">dashboard.webcore.dev</span>
            </div>
            <DashboardPreview initialScans={recentScans} />
          </div>
        </section>

        <Features />
        <div style={{ marginTop: '-170px' }}>
          <CurvedLoop
            marqueeText="Security ✦ SEO ✦ Domain health ✦ AI Readiness ✦ Performance ✦"
            speed={2.4}
            curveAmount={200}
            direction="right"
            interactive={true}
            className="curved-loop-text"
          />
        </div>
        <DocsSection />
      </main>

      <Footer />
    </div>
  )
}
