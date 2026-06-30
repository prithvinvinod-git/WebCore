"use client"
import { Terminal } from "@/components/ui/terminal"

export default function TerminalDemo() {
  return (
    <section className="w-full py-0 text-left">
      <Terminal
        commands={[
          "webcore@latest init",
          "npm start scan web@secure",
          "npx webcore@latest create dashboard/result",
          "type 'help' for assistance",
        ]}
        outputs={{
          0: [
            "✔ Analysed the website",
            "✔ Initialized System",
            "✔ Installed Dependencies",
          ],
          1: ["✔ Scan completed in 10s"],
          2: ["✔ Done. Created scan results"],
        }}
        typingSpeed={45}
        delayBetweenCommands={1000}
      />
    </section>
  )
}