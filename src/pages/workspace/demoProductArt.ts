// Clean, self-contained SVG icon illustrations for the /inquiry/recommend canned demo
// products (see demoAgentResponse.ts). Inline data URIs — zero network dependency, so
// there's no risk of a broken image mid-presentation.
function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const STAINLESS_TUMBLER_IMAGE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#dbeafe"/>
      <stop offset="1" stop-color="#bfdbfe"/>
    </linearGradient>
  </defs>
  <rect width="400" height="160" fill="url(#bg)"/>
  <g transform="translate(200,82)" fill="none" stroke="#1e40af" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-22,-45 h44 l-6,80 a10,10 0 0 1 -10,9 h-12 a10,10 0 0 1 -10,-9 z"/>
    <ellipse cx="0" cy="-45" rx="22" ry="6"/>
    <path d="M24,-28 q20,6 20,22 q0,16 -20,20"/>
  </g>
</svg>
`)

export const RECYCLED_FABRIC_POUCH_IMAGE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d1fae5"/>
      <stop offset="1" stop-color="#a7f3d0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="160" fill="url(#bg)"/>
  <g transform="translate(200,88)" fill="none" stroke="#065f46" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-35,-18 q0,-27 35,-27 q35,0 35,27 l8,55 a9,9 0 0 1 -9,10 h-68 a9,9 0 0 1 -9,-10 z"/>
    <path d="M-30,-20 q30,10 60,0"/>
    <circle cx="-8" cy="-42" r="3.5" fill="#065f46" stroke="none"/>
    <circle cx="10" cy="-42" r="3.5" fill="#065f46" stroke="none"/>
  </g>
</svg>
`)

export const SILICONE_PHONE_GRIP_IMAGE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ede9fe"/>
      <stop offset="1" stop-color="#ddd6fe"/>
    </linearGradient>
  </defs>
  <rect width="400" height="160" fill="url(#bg)"/>
  <g transform="translate(200,80)">
    <rect x="-30" y="-55" width="60" height="110" rx="12" fill="none" stroke="#5b21b6" stroke-width="5"/>
    <circle cx="0" cy="0" r="17" fill="#5b21b6"/>
    <circle cx="0" cy="0" r="6.5" fill="#ede9fe"/>
  </g>
</svg>
`)

export const DAILY_CALENDAR_SET_IMAGE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fef3c7"/>
      <stop offset="1" stop-color="#fde68a"/>
    </linearGradient>
  </defs>
  <rect width="400" height="160" fill="url(#bg)"/>
  <g transform="translate(200,82)" fill="none" stroke="#92400e" stroke-width="5" stroke-linejoin="round">
    <rect x="-45" y="-35" width="90" height="75" rx="8"/>
    <line x1="-45" y1="-14" x2="45" y2="-14"/>
    <line x1="-20" y1="-45" x2="-20" y2="-25"/>
    <line x1="20" y1="-45" x2="20" y2="-25"/>
    <rect x="-32" y="0" width="13" height="13" fill="#92400e" stroke="none"/>
    <rect x="-6" y="0" width="13" height="13"/>
    <rect x="19" y="0" width="13" height="13"/>
  </g>
</svg>
`)
