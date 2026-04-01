import { HeroSection } from "@/components/home/HeroSection"
import { LiveCounterSection } from "@/components/home/LiveCounterSection"
import { StatPills } from "@/components/home/StatPills"
import { ComparisonStrip } from "@/components/home/ComparisonStrip"
import { CTAButtons } from "@/components/home/CTAButtons"

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <LiveCounterSection />
      <StatPills />
      <CTAButtons />
      <ComparisonStrip />
    </main>
  )
}
