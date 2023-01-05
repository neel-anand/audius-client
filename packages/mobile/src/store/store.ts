import type { CommonState, RemoteConfigState } from '@audius/common'
import {
  remoteConfigReducer as remoteConfig,
  reducers as commonReducers
} from '@audius/common'
import backend from 'audius-client/src/common/store/backend/reducer'
import type { BackendState } from 'audius-client/src/common/store/backend/types'
import confirmer from 'audius-client/src/common/store/confirmer/reducer'
import type { ConfirmerState } from 'audius-client/src/common/store/confirmer/types'
import signOnReducer from 'audius-client/src/common/store/pages/signon/reducer'
import type {
  SignOnPageState,
  SignOnPageReducer
} from 'audius-client/src/common/store/pages/signon/types'
import searchBar from 'audius-client/src/common/store/search-bar/reducer'
import type SearchBarState from 'audius-client/src/common/store/search-bar/types'
import type { Store } from 'redux'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'

import type { DownloadState } from './download/slice'
import downloads from './download/slice'
import type { DrawersState } from './drawers/slice'
import drawers from './drawers/slice'
import type { KeyboardState } from './keyboard/slice'
import keyboard from './keyboard/slice'
import mobileUi from './mobileUi/slice'
import type { MobileUiState } from './mobileUi/slice'
import type { OAuthState } from './oauth/reducer'
import oauth from './oauth/reducer'
import type { OfflineDownloadsState } from './offline-downloads/slice'
import offlineDownloads from './offline-downloads/slice'
import rootSaga from './sagas'
import type { SearchState } from './search/reducer'
import search from './search/reducer'
import shareToStoryProgress from './share-to-story-progress/slice'
import type { ShareToStoryProgressState } from './share-to-story-progress/slice'
import { storeContext } from './storeContext'
import type { WalletConnectState } from './wallet-connect/slice'
import walletConnect from './wallet-connect/slice'

export type AppState = CommonState & {
  // These also belong in CommonState but are here until we move them to the @audius/common package:
  signOn: SignOnPageState
  backend: BackendState
  confirmer: ConfirmerState
  searchBar: SearchBarState

  drawers: DrawersState
  downloads: DownloadState
  keyboard: KeyboardState
  oauth: OAuthState
  offlineDownloads: OfflineDownloadsState
  remoteConfig: RemoteConfigState
  search: SearchState
  mobileUi: MobileUiState
  walletConnect: WalletConnectState
  shareToStoryProgress: ShareToStoryProgressState
}

const commonStoreReducers = commonReducers()

const createRootReducer = () =>
  combineReducers({
    ...commonStoreReducers,
    // These also belong in common store reducers but are here until we move them to the @audius/common package:
    backend,
    confirmer,
    signOn: signOnReducer as SignOnPageReducer,
    searchBar,

    drawers,
    downloads,
    keyboard,
    oauth,
    offlineDownloads,
    remoteConfig,
    search,
    mobileUi,
    walletConnect,
    shareToStoryProgress
  })

const sagaMiddleware = createSagaMiddleware({ context: storeContext })

const middlewares = [sagaMiddleware]

if (__DEV__) {
  const createDebugger = require('redux-flipper').default
  middlewares.push(createDebugger())
}

export const store = createStore(
  createRootReducer(),
  applyMiddleware(...middlewares)
) as unknown as Store<AppState> // need to explicitly type the store for offline-mode store reference

sagaMiddleware.run(rootSaga)

const { dispatch } = store
export { dispatch }
