import type { AccessibilityResult, Finding, WCAGCheck, ScreenReaderCheck, ContrastCheck } from "@/types/scan"
import { fetchUrl } from "@/scanner/lib/http-client"
import type { CheerioAPI } from "cheerio"

interface ScanInput { url: string; hostname: string }

export class AccessibilityScanner {
  private findings: Finding[] = []
  private score = 0
  private $: CheerioAPI | null = null
  private html = ""

  async scan(input: ScanInput): Promise<AccessibilityResult> {
    const result = await fetchUrl(input.url).catch(() => null)
    if (result && result.$) { this.$ = result.$; this.html = result.html }

    this.runChecks()
    this.calculateScore()

    return {
      score: this.score,
      grade: this.getGrade(this.score),
      findings: this.findings,
      wcagChecks: this.getWCAGChecks(),
      screenReader: this.getScreenReaderCheck(),
      contrast: this.getContrastCheck(),
      autoAudit: {
        passed: this.findings.filter((f) => f.passed).length,
        failed: this.findings.filter((f) => !f.passed).length,
        total: this.findings.length,
      },
    }
  }

  private addFinding(f: Finding) { this.findings.push(f) }

  private runChecks() {
    this.checkAltText()
    this.checkAria()
    this.checkLandmarks()
    this.checkHeadingHierarchy()
    this.checkColorContrast()
    this.checkFormLabels()
    this.checkLanguage()
    this.checkSkipLink()
    this.checkTabIndex()
    this.checkViewportZoom()
  }

  private checkAltText() {
    const $ = this.$
    if (!$) return
    const images = $("img")
    const withoutAlt = images.filter((_, el) => !$(el).attr("alt") && $(el).attr("alt") !== "")
    const emptyAlt = images.filter((_, el) => $(el).attr("alt") === "").length

    if (withoutAlt.length > 0) {
      this.addFinding({
        id: "a11y-alt-missing",
        category: "images",
        severity: "high",
        title: "Missing Alt Text",
        description: `${withoutAlt.length} image(s) without alt attribute — screen readers cannot describe them.`,
        passed: false,
        remediationPrompt: "Add descriptive alt text to all images.",
      })
    } else {
      this.addFinding({
        id: "a11y-alt-present",
        category: "images",
        severity: "low",
        title: "Alt Text",
        description: `All ${images.length} images have alt attributes. ${emptyAlt} decorative image(s) with empty alt.`,
        passed: true,
      })
    }
  }

  private checkAria() {
    const $ = this.$
    if (!$) return
    const ariaElements = $("[aria-label], [aria-labelledby], [aria-describedby], [aria-hidden]")
    const ariaRoles = $("[role]")
    const invalidAria = $('[role=""], [aria-label=""]')

    if (ariaElements.length > 0) {
      this.addFinding({
        id: "a11y-aria-usage",
        category: "aria",
        severity: invalidAria.length > 0 ? "medium" : "low",
        title: "ARIA Usage",
        description: `${ariaElements.length} ARIA element(s), ${ariaRoles.length} role(s). ${invalidAria.length > 0 ? `${invalidAria.length} empty ARIA attribute(s).` : ""}`,
        passed: invalidAria.length === 0,
      })
    } else {
      this.addFinding({
        id: "a11y-aria-missing",
        category: "aria",
        severity: "medium",
        title: "No ARIA Attributes",
        description: "No ARIA attributes found — complex UI may lack screen reader context.",
        passed: false,
      })
    }
  }

  private checkLandmarks() {
    const $ = this.$
    if (!$) return
    const roles = ["main", "navigation", "banner", "contentinfo", "complementary", "region", "search", "form"]
    const landmarksWithRole = roles.reduce((acc, r) => acc + $('[role="' + r + '"]').length, 0)
    const semanticLandmarks = ["header", "footer", "nav", "main", "aside"].reduce((acc, tag) => acc + $(tag).length, 0)
    const total = landmarksWithRole + semanticLandmarks

    this.addFinding({
      id: "a11y-landmarks",
      category: "structure",
      severity: total < 3 ? "high" : total < 5 ? "medium" : "low",
      title: "Landmark Regions",
      description: `${total} landmark(s) detected (${landmarksWithRole} ARIA, ${semanticLandmarks} semantic). ${total >= 3 ? "Good." : "At least 3 recommended for navigation."}`,
      passed: total >= 3,
      remediationPrompt: total < 3 ? "Add ARIA landmark roles (banner, main, contentinfo) for screen reader navigation." : undefined,
    })
  }

  private checkHeadingHierarchy() {
    const $ = this.$
    if (!$) return
    const headings: number[] = []
    for (let i = 1; i <= 6; i++) {
      headings.push($("h" + i).length)
    }
    const hasH1 = headings[0] > 0
    const hasH2 = headings[1] > 0
    const skipLevel = headings.findIndex((count, i) => count > 0 && i > 0 && headings[i - 1] === 0 && i > 0)

    this.addFinding({
      id: "a11y-headings-structure",
      category: "structure",
      severity: !hasH1 ? "critical" : skipLevel !== -1 ? "medium" : headings[0] > 1 ? "medium" : "low",
      title: "Heading Hierarchy",
      description: `H1: ${headings[0]}, H2: ${headings[1]}, H3: ${headings[2]}, H4: ${headings[3]}, H5: ${headings[4]}, H6: ${headings[5]}. ${!hasH1 ? "Missing H1!" : skipLevel !== -1 ? "Heading level skipped." : headings[0] > 1 ? "Multiple H1s." : "Proper hierarchy."}`,
      passed: hasH1 && skipLevel === -1 && headings[0] <= 1,
      remediationPrompt: !hasH1 ? "Add exactly one <h1> element." : skipLevel !== -1 ? "Do not skip heading levels (e.g., H1 → H3 without H2)." : undefined,
    })
  }

  private checkColorContrast() {
    const $ = this.$
    if (!$) return
    const bodyText = $("body").text() || ""
    const smallText = bodyText.replace(/\s+/g, " ").trim()
    const hasSmallText = smallText.length > 100

    this.addFinding({
      id: "a11y-contrast",
      category: "visual",
      severity: "medium",
      title: "Color Contrast (Basic Check)",
      description: `${hasSmallText ? "Small text present — requires 4.5:1 contrast ratio." : "Limited text."} Automated contrast check requires visual analysis.`,
      passed: false,
      remediationPrompt: "Ensure text has 4.5:1 contrast (3:1 for large text). Use tools like axe DevTools to verify.",
    })
  }

  private checkFormLabels() {
    const $ = this.$
    if (!$) return
    const inputs = $("input:not([type=hidden]), select, textarea")
    const labelled = inputs.filter((_, el) => {
      const id = $(el).attr("id")
      return !!($(el).attr("aria-label") || $(el).attr("aria-labelledby") || $(`label[for="${id}"]`).length > 0 || $(el).closest("label").length > 0)
    })
    const unlabelled = inputs.length - labelled.length

    if (unlabelled > 0) {
      this.addFinding({
        id: "a11y-form-labels",
        category: "forms",
        severity: "high",
        title: "Unlabeled Form Controls",
        description: `${unlabelled}/${inputs.length} input(s) without labels — screen readers cannot identify them.`,
        passed: false,
        remediationPrompt: "Associate a <label> with every form control via 'for' attribute or wrapping.",
      })
    } else {
      this.addFinding({
        id: "a11y-form-labels-ok",
        category: "forms",
        severity: "low",
        title: "Form Labels",
        description: `All ${inputs.length} form controls have labels.`,
        passed: true,
      })
    }
  }

  private checkLanguage() {
    const $ = this.$
    if (!$) return
    const lang = $("html").attr("lang")
    this.addFinding({
      id: "a11y-lang",
      category: "internationalization",
      severity: lang ? (lang.length === 2 || lang.length === 5 ? "low" : "medium") : "high",
      title: "Language Attribute",
      description: lang ? `lang="${lang}" found.` : "No lang attribute on <html> — screen readers may use wrong voice.",
      passed: !!lang && (lang.length === 2 || lang.length === 5),
      remediationPrompt: !lang ? 'Add lang="en" (or your language) to the <html> tag.' : undefined,
    })
  }

  private checkSkipLink() {
    const $ = this.$
    if (!$) return
    const skipLinks = $('a[href^="#main"], a[href^="#content"], a[href^="#skip"]')
    this.addFinding({
      id: "a11y-skip-link",
      category: "navigation",
      severity: skipLinks.length > 0 ? "low" : "medium",
      title: "Skip Navigation Link",
      description: skipLinks.length > 0 ? "Skip link found." : "No skip navigation link — keyboard users must tab through all nav items.",
      passed: skipLinks.length > 0,
      remediationPrompt: !skipLinks.length ? 'Add a "Skip to content" link as the first focusable element.' : undefined,
    })
  }

  private checkTabIndex() {
    const $ = this.$
    if (!$) return
    const positiveTab = $("[tabindex]").filter((_, el) => {
      const val = parseInt($(el).attr("tabindex") || "0", 10)
      return val > 0
    })
    this.addFinding({
      id: "a11y-tabindex",
      category: "keyboard",
      severity: positiveTab.length > 0 ? "medium" : "low",
      title: "Tab Index",
      description: positiveTab.length > 0
        ? `${positiveTab.length} element(s) with positive tabindex — disrupts natural tab order.`
        : "No positive tabindex values — good natural tab order.",
      passed: positiveTab.length === 0,
      remediationPrompt: positiveTab.length > 0 ? "Avoid positive tabindex values; use DOM order for natural tab flow." : undefined,
    })
  }

  private checkViewportZoom() {
    const $ = this.$
    if (!$) return
    const viewport = $('meta[name="viewport"]')
    const content = viewport.attr("content") || ""
    const hasMaxScale = /maximum-scale\s*=\s*1(\.0+)?/.test(content)
    const hasUserScalable = /user-scalable\s*=\s*no/.test(content)

    this.addFinding({
      id: "a11y-zoom",
      category: "visual",
      severity: hasMaxScale || hasUserScalable ? "high" : "low",
      title: "Viewport Zoom",
      description: hasMaxScale || hasUserScalable
        ? "Viewport prevents zoom — WCAG 1.4.4 failure."
        : "Zoom is allowed — good for low-vision users.",
      passed: !hasMaxScale && !hasUserScalable,
      remediationPrompt: hasMaxScale || hasUserScalable ? "Remove maximum-scale=1 and user-scalable=no from the viewport meta tag." : undefined,
    })
  }

  private getWCAGChecks(): WCAGCheck[] {
    const categoryMap: Record<string, WCAGCheck> = {}
    for (const f of this.findings) {
      const key = f.category
      if (!categoryMap[key]) categoryMap[key] = { category: key, passed: 0, total: 0, score: 0, critical: 0 }
      categoryMap[key].total++
      if (f.passed) categoryMap[key].passed++
      if (f.severity === "critical" || f.severity === "high") categoryMap[key].critical++
    }
    return Object.values(categoryMap).map((c) => ({ ...c, score: Math.round((c.passed / c.total) * 100) }))
  }

  private getScreenReaderCheck(): ScreenReaderCheck {
    const $ = this.$
    if (!$) return { optimal: false, issuesFound: 0, allImagesLabelled: false, headingStructure: false, ariaLive: false, keyboardNavigable: false }
    return {
      optimal: this.findings.filter((f) => f.passed).length >= this.findings.length * 0.7,
      issuesFound: this.findings.filter((f) => !f.passed && (f.category === "images" || f.category === "aria" || f.category === "forms" || f.category === "structure")).length,
      allImagesLabelled: this.findings.some((f) => f.id === "a11y-alt-present"),
      headingStructure: !this.findings.some((f) => f.id === "a11y-headings-structure" && !f.passed),
      ariaLive: !!$("[aria-live]").length,
      keyboardNavigable: !this.findings.some((f) => f.id === "a11y-tabindex" && !f.passed),
    }
  }

  private getContrastCheck(): ContrastCheck {
    return {
      passed: false,
      failingElements: [],
      recommendations: ["Use a contrast checker tool (e.g., axe DevTools, Wave) to verify all text meets 4.5:1 ratio."],
      smallTextRatio: "4.5:1 (target)",
      largeTextRatio: "3:1 (target)",
    }
  }

  private calculateScore() {
    const passed = this.findings.filter((f) => f.passed).length
    const total = this.findings.length || 1
    this.score = Math.round((passed / total) * 100)
  }

  private getGrade(score: number): string {
    if (score >= 90) return "A+"
    if (score >= 80) return "A"
    if (score >= 70) return "B"
    if (score >= 60) return "C"
    return "D"
  }
}
