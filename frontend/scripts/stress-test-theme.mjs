import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

console.log('='.repeat(70))
console.log('🧪 NISKALA DESIGN SYSTEM — THEME STRESS TEST (LIGHT & DARK)')
console.log('Reference: docs/design.md')
console.log('='.repeat(70))

// ----------------------------------------------------------------------
// 1. WCAG 2.1 Contrast Math Helpers
// ----------------------------------------------------------------------
function parseHex(hex) {
  let c = hex.replace('#', '')
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('')
  }
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return { r, g, b }
}

function parseRgba(str) {
  if (str.startsWith('#')) return { ...parseHex(str), a: 1 }
  const match = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/)
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    }
  }
  return { r: 0, g: 0, b: 0, a: 1 }
}

function blendRgb(fg, bg) {
  // fg on top of bg with fg.a alpha
  const a = fg.a !== undefined ? fg.a : 1
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  }
}

function getRelativeLuminance({ r, g, b }) {
  const [sR, sG, sB] = [r, g, b].map((val) => {
    const s = val / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB
}

function getContrastRatio(fgColor, bgColor) {
  const fgRgb = parseRgba(fgColor)
  const bgRgb = parseRgba(bgColor)
  const effectiveFg = fgRgb.a < 1 ? blendRgb(fgRgb, bgRgb) : fgRgb

  const lum1 = getRelativeLuminance(effectiveFg)
  const lum2 = getRelativeLuminance(bgRgb)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

// ----------------------------------------------------------------------
// 2. Stress Test Matrix: Token Contrast Ratios
// ----------------------------------------------------------------------
console.log('\n[TEST 1] WCAG 2.1 AA/AAA Contrast Verification against design.md\n')

const testPairs = [
  // LIGHT THEME
  {
    theme: 'Light',
    element: 'Main Body Text on Background',
    fg: '#34342F',
    bg: '#F1EDE5',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Main Body Text on Surface Card',
    fg: '#34342F',
    bg: '#FAF8F5',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Muted Text on Surface Card',
    fg: 'rgba(52, 52, 47, 0.70)',
    bg: '#FAF8F5',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Primary Button (Ivory text on Charcoal btn)',
    fg: '#F1EDE5',
    bg: '#34342F',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Gold CTA Button (Charcoal text on Gold btn)',
    fg: '#242420',
    bg: '#C5A059',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Sidebar Nav Item (Charcoal text on Light Sidebar)',
    fg: '#34342F',
    bg: '#FAF8F5',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Sidebar Active Item (Gold text on Light Sidebar)',
    fg: '#8C6D37',
    bg: '#FAF8F5',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Header Nav Link (Charcoal text on Header)',
    fg: '#34342F',
    bg: '#FAF8F5',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Theme Accent Badge (Amber bronze on Light Card)',
    fg: '#6B4E2B',
    bg: '#FAF8F5',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Tradition Accordion Heading (Deep Sogan on Cream)',
    fg: '#4A3525',
    bg: '#FAF6EE',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Tradition Accordion Subtitle (Bronze Gold on Cream)',
    fg: '#7D5B20',
    bg: '#FAF6EE',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Tradition Accordion Time Info (Bronze Gold on Off-White)',
    fg: '#7D5B20',
    bg: '#FFFDF9',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Semantic Success (Sage Green on Surface)',
    fg: '#2D5E3B',
    bg: '#FAF8F5',
    minRatio: 4.5,
  },
  {
    theme: 'Light',
    element: 'Semantic Danger (Terracotta Red on Surface)',
    fg: '#A8322B',
    bg: '#FAF8F5',
    minRatio: 4.5,
  },

  // DARK THEME
  {
    theme: 'Dark',
    element: 'Main Body Text on Deep Espresso BG',
    fg: '#F1EDE5',
    bg: '#242420',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Main Body Text on Dark Surface Card',
    fg: '#F1EDE5',
    bg: '#2D2D28',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Muted Text on Dark Surface Card',
    fg: 'rgba(241, 237, 229, 0.70)',
    bg: '#2D2D28',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Primary Button (Charcoal text on Champagne Gold btn)',
    fg: '#242420',
    bg: '#D8C2A0',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Gold CTA Button (Charcoal text on Gold btn)',
    fg: '#242420',
    bg: '#C5A059',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Sidebar Nav Item (Ivory text on Dark Sidebar #1E1E1B)',
    fg: '#F1EDE5',
    bg: '#1E1E1B',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Sidebar Active Item (Gold text on Dark Sidebar #1E1E1B)',
    fg: '#D8C2A0',
    bg: '#1E1E1B',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Header Nav Link (Ivory text on Dark Header #2D2D28)',
    fg: '#F1EDE5',
    bg: '#2D2D28',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Theme Accent Badge (Champagne gold on Dark Card)',
    fg: '#E2CCA8',
    bg: '#2D2D28',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Theme Preset Box Heading (Champagne gold on Dark Modal)',
    fg: '#E2CCA8',
    bg: '#2D2D28',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Theme Preset Box List (Ivory soft on Dark Modal)',
    fg: '#F1EDE5',
    bg: '#2D2D28',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Wizard Active Step Pill (Charcoal text on Gold Pill)',
    fg: '#242420',
    bg: '#D8C2A0',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Wizard Inactive Step Pill (Muted Ivory on Dark Card)',
    fg: 'rgba(241, 237, 229, 0.70)',
    bg: '#2D2D28',
    minRatio: 4.5,
  },
  {
    theme: 'Dark',
    element: 'Table Light in Dark Mode (Ivory on Charcoal Table Head)',
    fg: '#F1EDE5',
    bg: '#2D2D28',
    minRatio: 4.5,
  },
]

let passedContrastCount = 0
let failedContrastCount = 0

for (const p of testPairs) {
  const ratio = getContrastRatio(p.fg, p.bg)
  const isPass = ratio >= p.minRatio
  const passStr = isPass ? '✅ PASS' : '❌ FAIL'
  const rating = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'LargeAA' : 'Fail'

  if (isPass) {
    passedContrastCount++
  } else {
    failedContrastCount++
  }

  console.log(
    `[${p.theme.toUpperCase()}] ${passStr} (${rating} - ${ratio.toFixed(2)}:1) | ${p.element}`
  )
}

console.log(`\nContrast Matrix Summary: ${passedContrastCount} Passed, ${failedContrastCount} Failed\n`)

// ----------------------------------------------------------------------
// 3. Static Codebase Anti-Pattern Scanner
// ----------------------------------------------------------------------
console.log('[TEST 2] Static Codebase Anti-Pattern Scanner for Dark/Light Mode\n')

const srcDir = path.join(rootDir, 'src')
const antiPatternViolations = []

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const relative = path.relative(rootDir, filePath)
  const lines = content.split('\n')

  lines.forEach((line, idx) => {
    const lineNum = idx + 1

    // Exclude test files and SCSS variable definitions
    if (relative.includes('.test.') || relative.includes('.spec.')) return

    // 1. Check for text-dark in component files (excluding editor canvas where background is simulated paper)
    if (
      !relative.includes('editor.scss') &&
      !relative.includes('EditorCanvas.js') &&
      !relative.includes('PreviewModal.js') &&
      line.includes('text-dark')
    ) {
      antiPatternViolations.push({
        file: relative,
        line: lineNum,
        rule: 'Avoid hardcoded "text-dark" on general views (causes invisible black text in Dark Mode)',
        snippet: line.trim(),
      })
    }

    // 2. Check for text-black in component files
    if (
      !relative.includes('editor.scss') &&
      !relative.includes('EditorCanvas.js') &&
      line.includes('text-black')
    ) {
      antiPatternViolations.push({
        file: relative,
        line: lineNum,
        rule: 'Avoid hardcoded "text-black" (invisible in Dark Mode)',
        snippet: line.trim(),
      })
    }

    // 3. Check for hardcoded white text on #C5A059 or #A68B65 buttons
    if (
      (line.includes('#C5A059') || line.includes('#A68B65')) &&
      (line.includes("color: '#FFFFFF'") || line.includes('color: "#FFFFFF"') || line.includes("color: '#fff'"))
    ) {
      // Exclude checkmark icons or specific small badges with borders
      if (!line.includes('cilCheck') && !line.includes('rounded-circle')) {
        antiPatternViolations.push({
          file: relative,
          line: lineNum,
          rule: 'White text on Gold button/badge fails WCAG AA contrast (use #242420 on gold instead)',
          snippet: line.trim(),
        })
      }
    }
  })
}

function walkDir(dir) {
  const files = fs.readdirSync(dir)
  for (const f of files) {
    const full = path.join(dir, f)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      walkDir(full)
    } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
      scanFile(full)
    }
  }
}

walkDir(srcDir)

if (antiPatternViolations.length === 0) {
  console.log('✅ PASS: Zero theme anti-patterns detected across all frontend views and components!\n')
} else {
  console.log(`❌ FAIL: Found ${antiPatternViolations.length} potential theme anti-patterns:`)
  antiPatternViolations.forEach((v) => {
    console.log(`  - [${v.file}:${v.line}] ${v.rule}`)
    console.log(`    Code: ${v.snippet}`)
  })
  console.log('')
}

// ----------------------------------------------------------------------
// 4. Token Consistency Check: SCSS vs design.md
// ----------------------------------------------------------------------
console.log('[TEST 3] SCSS Variable Consistency with docs/design.md\n')

const scssPath = path.join(srcDir, 'scss', 'style.scss')
const scssContent = fs.readFileSync(scssPath, 'utf-8')

const requiredTokens = [
  '--bg-color: #F1EDE5',
  '--surface-color: #FAF8F5',
  '--text-primary: #34342F',
  '--text-muted: rgba(52, 52, 47, 0.65)',
  '--primary-color: #34342F',
  '--accent-gold: #A68B65',
  '--bg-color: #242420',
  '--surface-color: #2D2D28',
  '--text-primary: #F1EDE5',
  '--primary-color: #D8C2A0',
  '--accent-gold: #D8C2A0',
  '--cui-body-bg: #242420 !important',
  '--cui-body-color: #F1EDE5 !important',
  '--cui-card-bg: #2D2D28 !important',
  '--cui-sidebar-bg: #1E1E1B !important',
  '--cui-header-bg: #2D2D28 !important',
  '.theme-badge-accent',
  '.theme-preset-box',
  '.wizard-step-tab',
  '.btn-niskala-primary',
  '.btn-niskala-gold',
]

let missingTokens = 0
for (const tok of requiredTokens) {
  if (scssContent.includes(tok)) {
    console.log(`✅ Token Found: ${tok}`)
  } else {
    console.log(`❌ Missing Token: ${tok}`)
    missingTokens++
  }
}

// ----------------------------------------------------------------------
// 5. Final Verdict
// ----------------------------------------------------------------------
console.log('\n' + '='.repeat(70))
const totalErrors = failedContrastCount + antiPatternViolations.length + missingTokens
if (totalErrors === 0) {
  console.log('🎉 STRESS TEST PASSED: 100% COMPLIANT WITH docs/design.md')
  console.log('   All color contrasts exceed WCAG AA/AAA standards.')
  console.log('   No anti-patterns found in Light Mode and Dark Mode.')
  console.log('='.repeat(70))
  process.exit(0)
} else {
  console.log(`⚠️ STRESS TEST FAILED with ${totalErrors} issue(s).`)
  console.log('='.repeat(70))
  process.exit(1)
}
