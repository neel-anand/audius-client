// @ts-nocheck
// TODO(nkang) - convert to TS
import { RESET_SUCCEEDED, stripPrefix } from 'store/lineup/actions'
import { initialLineupState } from 'store/lineup/reducer'
import { PREFIX } from 'store/pages/feed/lineup/actions'

export const initialState = {
  ...initialLineupState,
  prefix: PREFIX,
  dedupe: true,
  containsDeleted: false,
  entryIds: new Set([])
}

const actionsMap = {
  [RESET_SUCCEEDED](state, action) {
    const newState = initialState
    return newState
  }
}

const feed = (state = initialState, action) => {
  const baseActionType = stripPrefix(PREFIX, action.type)
  const matchingReduceFunction = actionsMap[baseActionType]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}

export default feed
