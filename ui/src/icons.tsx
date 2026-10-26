import { createElement, type SVGProps } from 'react'

// Self-contained SVG icons so the app never depends on which names the host's
// vendored `lucide-react` happens to export (importing a missing name makes the
// whole module fail to load). Same `size`/`color` call shape as lucide.

type IconProps = SVGProps<SVGSVGElement> & { size?: number; color?: string }

function make(paths: string, extra?: (p: IconProps) => React.ReactNode) {
  return function Icon({ size = 16, color = 'currentColor', ...rest }: IconProps) {
    return createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...rest,
      },
      ...paths.split('|').map((d, i) => createElement('path', { key: i, d })),
      extra ? extra({ size, color, ...rest }) : null
    )
  }
}

export const FileText = make(
  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|M14 2v6h6|M16 13H8|M16 17H8|M10 9H8'
)
export const Pencil = make('M12 20h9|M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z')
export const Plus = make('M12 5v14|M5 12h14')
export const Trash2 = make(
  'M3 6h18|M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2|M10 11v6|M14 11v6'
)
export const Upload = make('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M17 8l-5-5-5 5|M12 3v12')
export const BookOpen = make(
  'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z|M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'
)
export const Wrench = make(
  'M14.7 6.3a4 4 0 0 0-5.3 5.3L3 18l3 3 6.4-6.4a4 4 0 0 0 5.3-5.3l-2.8 2.8-2.1-2.1z'
)
export const AlertTriangle = make(
  'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z|M12 9v4|M12 17h.01'
)
export const CheckCircle2 = make('M22 11.1V12a10 10 0 1 1-5.9-9.1|M22 4 12 14.01l-3-3')
export const CheckSquare = make('M9 11l3 3L22 4|M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11')
export const Square = make('M3 3h18v18H3z')
export const RefreshCw = make(
  'M21 2v6h-6|M3 22v-6h6|M3.5 9a9 9 0 0 1 14.9-3.4L21 8|M20.5 15a9 9 0 0 1-14.9 3.4L3 16'
)
export const XCircle = make('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z|M15 9l-6 6|M9 9l6 6')
export const GitPullRequest = make(
  'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z|M6 9v12|M18 18a3 3 0 1 0 0 6 3 3 0 0 0 0-6z|M13 6h3a2 2 0 0 1 2 2v10'
)
export const Loader2 = make('M21 12a9 9 0 1 1-6.2-8.5')
