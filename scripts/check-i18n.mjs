import { readdirSync, readFileSync } from 'node:fs'

const DIRS = ['web/locales', 'api/src/locales']
const BASE = 'en.json'

const flat = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flat(v, `${p}${k}.`) : [`${p}${k}`],
  )
const keys = (file) => new Set(flat(JSON.parse(readFileSync(file, 'utf8'))))

let ko = false
for (const dir of DIRS) {
  const base = keys(`${dir}/${BASE}`)
  for (const f of readdirSync(dir).filter((f) => f !== BASE)) {
    const k = keys(`${dir}/${f}`)
    const missing = [...base].filter((x) => !k.has(x))
    const extra = [...k].filter((x) => !base.has(x))
    if (missing.length || extra.length) {
      ko = true
      console.error(`${dir}/${f}`, { missing, extra })
    }
  }
}
if (!ko) console.log('locales are in sync')
process.exit(ko ? 1 : 0)
