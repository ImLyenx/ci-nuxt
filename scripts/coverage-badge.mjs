import { readFileSync, writeFileSync } from 'node:fs'

const [input, output] = process.argv.slice(2)
const pct = Math.floor(JSON.parse(readFileSync(input, 'utf8')).total.lines.pct)
const color = pct >= 90 ? '#4c1' : pct >= 75 ? '#dfb317' : '#e05d44'

writeFileSync(
  output,
  `<svg xmlns="http://www.w3.org/2000/svg" width="104" height="20" role="img" aria-label="coverage: ${pct}%">
<rect width="62" height="20" fill="#555"/>
<rect x="62" width="42" height="20" fill="${color}"/>
<g fill="#fff" font-family="Verdana,sans-serif" font-size="11" text-anchor="middle">
<text x="31" y="14">coverage</text>
<text x="83" y="14">${pct}%</text>
</g>
</svg>
`,
)
