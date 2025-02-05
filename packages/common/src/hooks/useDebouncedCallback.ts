import type { DependencyList } from 'react'
import { useMemo } from 'react'

import { debounce } from 'lodash'

export const useDebouncedCallback = <T extends (...args: any) => any>(
  callback: T,
  wait: number,
  deps: DependencyList
) => {
  return useMemo(
    () => debounce(callback, wait),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wait, ...deps]
  )
}
