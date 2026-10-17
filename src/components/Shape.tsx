import type { CSSProperties, ReactNode } from 'react'

/**
 * An absolutely positioned div. All garden illustrations are CSS shapes,
 * so this is the building block for every petal, rock and face. Uses
 * content-box sizing (like the reference) so bordered shapes keep their size.
 */
export function Shape({ s, className, children }: { s: CSSProperties; className?: string; children?: ReactNode }) {
  return <div className={className} style={{ position: 'absolute', boxSizing: 'content-box', ...s }}>{children}</div>
}
