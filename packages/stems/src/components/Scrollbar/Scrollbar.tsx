import { useEffect, useRef, useMemo } from 'react'

import cn from 'classnames'
import { uniqueId } from 'lodash'
import PerfectScrollbar from 'react-perfect-scrollbar'

import styles from './Scrollbar.module.css'
import { ScrollbarProps } from './types'

/**
 * A container with a custom scrollbar, meant to be used for small scrolling areas within a
 * page/view (e.g. a scrolling navigation bar), not the entire page itself.
 * `Scrollbar` uses react-perfect-scrollbar (https://www.npmjs.com/package/react-perfect-scrollbar)
 * under the hood. For advanced use cases, refer to the documentation.
 */
export const Scrollbar = ({
  children,
  className,
  id,
  ...props
}: ScrollbarProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const elementId = useMemo(() => id || uniqueId('scrollbar-'), [id])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const hideScrollbar = () => {
    const element = document.getElementById(elementId)
    if (element) {
      element.classList.remove('scrollbar--hovered-visible')
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }
  }

  const showScrollbar = () => {
    const element = document.getElementById(elementId)
    if (element) {
      element.classList.add('scrollbar--hovered-visible')
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      const element = document.getElementById(elementId)
      if (element) {
        element.classList.remove('scrollbar--hovered-visible')
      }
    }, 1400)
  }

  return (
    <PerfectScrollbar
      {...props}
      id={elementId}
      className={cn(styles.scrollbar, className)}
      onMouseEnter={showScrollbar}
      onMouseLeave={hideScrollbar}
    >
      <div>{children}</div>
    </PerfectScrollbar>
  )
}
