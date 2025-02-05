import {
  SolanaClient,
  CommonStoreContext,
  OpenSeaClient,
  FeatureFlags
} from '@audius/common'
import * as Sentry from '@sentry/browser'

import * as analytics from 'services/analytics'
import { audioPlayer } from 'services/audio-player'
import { apiClient } from 'services/audius-api-client'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { audiusSdk } from 'services/audius-sdk'
import { env } from 'services/env'
import { explore } from 'services/explore'
import { fingerprintClient } from 'services/fingerprint'
import { localStorage } from 'services/local-storage'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { trackDownload } from 'services/track-download'
import { walletClient } from 'services/wallet-client'
import { isElectron } from 'utils/clientUtil'
import { share } from 'utils/share'

import { getLineupSelectorForRoute } from './lineup/lineupForRoute'

export const storeContext: CommonStoreContext = {
  getLocalStorageItem: async (key: string) =>
    window?.localStorage?.getItem(key),
  setLocalStorageItem: async (key: string, value: string) =>
    window?.localStorage?.setItem(key, value),
  // Note: casting return type to Promise<boolean> to maintain pairity with mobile, but
  // it may be best to update mobile to not be async
  getFeatureEnabled: getFeatureEnabled as unknown as (
    flag: FeatureFlags
  ) => Promise<boolean>,
  analytics,
  remoteConfigInstance,
  audiusBackendInstance,
  apiClient,
  fingerprintClient,
  walletClient,
  localStorage,
  isNativeMobile: false,
  isElectron: isElectron(),
  env,
  explore,
  // @ts-ignore js file
  getLineupSelectorForRoute,
  audioPlayer,
  solanaClient: new SolanaClient({
    solanaClusterEndpoint: process.env.REACT_APP_SOLANA_CLUSTER_ENDPOINT,
    metadataProgramId: process.env.REACT_APP_METADATA_PROGRAM_ID
  }),
  sentry: Sentry,
  trackDownload,
  instagramAppId: process.env.REACT_APP_INSTAGRAM_APP_ID,
  instagramRedirectUrl: process.env.REACT_APP_INSTAGRAM_REDIRECT_URL,
  share,
  openSeaClient: new OpenSeaClient(
    process.env.REACT_APP_OPENSEA_API_URL as string
  ),
  audiusSdk
}
