import {
  Name,
  accountSelectors,
  getContext,
  waitForValue,
  signOutActions,
  deactivateAccountActions
} from '@audius/common'
import { call, delay, put, select, takeEvery } from 'typed-redux-saga'

import { make } from 'common/store/analytics/actions'
import { requestConfirmation } from 'common/store/confirmer/actions'
import { confirmTransaction } from 'common/store/confirmer/sagas'
import { getConfirmCalls } from 'common/store/confirmer/selectors'
import { waitForWrite } from 'utils/sagaHelpers'

const { afterDeactivationSignOut, deactivateAccount, deactivateAccountFailed } =
  deactivateAccountActions
const { signOut } = signOutActions
const { getAccountUser, getUserId } = accountSelectors

const DEACTIVATE_CONFIRMATION_UID = 'DEACTIVATE'

function* handleDeactivateAccount() {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  try {
    yield* waitForWrite()

    const accountUserId = yield* select(getUserId)
    const userMetadata = yield* select(getAccountUser)
    if (!accountUserId || !userMetadata) return
    yield* put(
      requestConfirmation(
        DEACTIVATE_CONFIRMATION_UID,
        function* () {
          yield* put(make(Name.DEACTIVATE_ACCOUNT_REQUEST, {}))
          const result = yield* call(
            audiusBackendInstance.updateCreator,
            { ...userMetadata, is_deactivated: true },
            accountUserId /* note: as of writing, unused parameter */
          )
          if (!result) return
          const { blockHash, blockNumber } = result
          const confirmed = yield* call(
            confirmTransaction,
            blockHash,
            blockNumber
          )
          if (!confirmed) {
            throw new Error(
              `Could not confirm account deactivation for user ${accountUserId}`
            )
          }
        },
        // @ts-ignore: confirmer is untyped
        function* () {
          yield* put(make(Name.DEACTIVATE_ACCOUNT_SUCCESS, {}))
          // Do the signout in another action so confirmer can clear
          yield* put(afterDeactivationSignOut())
        },
        function* () {
          yield* put(make(Name.DEACTIVATE_ACCOUNT_FAILURE, {}))
          yield* put(deactivateAccountFailed())
        }
      )
    )
  } catch (e) {
    console.error(e)
    yield* put(make(Name.DEACTIVATE_ACCOUNT_FAILURE, {}))
    yield* put(deactivateAccountFailed())
  }
}

function* waitAndSignOut() {
  // Wait for all confirmations to end so that reloading doesn't trigger beforeUnload dialog
  // Note: Waiting for getIsConfirming doesn't appear to work here
  yield call(waitForValue, getConfirmCalls, {}, (confirmCalls) => {
    return Object.keys(confirmCalls).length === 0
  })
  // Give a brief delay to allow the beforeUnload handler to clear
  yield delay(10)
  yield put(signOut())
}

function* watchDeactivateAccount() {
  yield takeEvery(deactivateAccount, handleDeactivateAccount)
}
function* watchAfterDeactivationSignOut() {
  yield takeEvery(afterDeactivationSignOut, waitAndSignOut)
}

export default function sagas() {
  return [watchDeactivateAccount, watchAfterDeactivationSignOut]
}
