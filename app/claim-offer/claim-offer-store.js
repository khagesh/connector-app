// @flow
import { put, takeLatest, call, all, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import {
  CLAIM_OFFER_STATUS,
  CLAIM_OFFER_RECEIVED,
  CLAIM_OFFER_SHOWN,
  CLAIM_OFFER_ACCEPTED,
  CLAIM_OFFER_REJECTED,
  SEND_CLAIM_REQUEST,
  CLAIM_REQUEST_SUCCESS,
  CLAIM_REQUEST_FAIL,
  CLAIM_OFFER_IGNORED,
  CLAIM_REQUEST_STATUS,
} from './type-claim-offer'
import type {
  ClaimOfferStore,
  ClaimOfferAction,
  ClaimOfferShownAction,
  ClaimOfferAcceptedAction,
  ClaimOfferResponse,
  ClaimOfferPayload,
} from './type-claim-offer'
import type {
  AdditionalDataPayload,
  NotificationPayloadInfo,
} from '../push-notification/type-push-notification'
import type { CustomError } from '../common/type-common'
import {
  getAgencyUrl,
  getClaimOffer,
  getUserPairwiseDid,
} from '../store/store-selector'
import { sendClaimRequest as sendClaimRequestApi } from '../api/api'
import type { IndyClaimOffer } from '../bridge/react-native-cxs/type-cxs'
import { generateClaimRequest } from '../bridge/react-native-cxs/RNCxs'

const claimOfferInitialState = {}

// TODO:PS: data structure for claim offer received should be flat
// It should not have only payload
// Merge payload and payloadInfo
export const claimOfferReceived = (
  payload: AdditionalDataPayload,
  payloadInfo: NotificationPayloadInfo
) => ({
  type: CLAIM_OFFER_RECEIVED,
  payload,
  payloadInfo,
})

// this action is used because we don't want to show claim offer again to user
// we set claim offer status as shown, so another code path doesn't show it
export const claimOfferShown = (uid: string) => ({
  type: CLAIM_OFFER_SHOWN,
  uid,
})

export const claimOfferIgnored = (uid: string) => ({
  type: CLAIM_OFFER_IGNORED,
  uid,
})

export const claimOfferRejected = (uid: string) => ({
  type: CLAIM_OFFER_REJECTED,
  uid,
})

export const sendClaimRequest = (uid: string) => ({
  type: SEND_CLAIM_REQUEST,
  uid,
})

export const claimRequestSuccess = (uid: string) => ({
  type: CLAIM_REQUEST_SUCCESS,
  uid,
})

export const claimRequestFail = (uid: string, error: CustomError) => ({
  type: CLAIM_REQUEST_FAIL,
  error,
  uid,
})

export const acceptClaimOffer = (uid: string) => ({
  type: CLAIM_OFFER_ACCEPTED,
  uid,
})

export function* claimOfferAccepted(
  action: ClaimOfferAcceptedAction
): Generator<*, *, *> {
  const claimOfferPayload: ClaimOfferPayload = yield select(
    getClaimOffer,
    action.uid
  )
  const indyClaimOffer: IndyClaimOffer = {
    issuerDid: claimOfferPayload.issuer.did,
    schemaSequenceNumber:
      claimOfferPayload.data.claimDefinitionSchemaSequenceNumber,
  }
  const remoteDid = claimOfferPayload.remotePairwiseDID
  const userPairwiseDid: string | null = yield select(
    getUserPairwiseDid,
    remoteDid
  )

  if (userPairwiseDid) {
    // set status that we are generating and sending claim request
    yield put(sendClaimRequest(action.uid))
    try {
      const agencyUrl: string = yield select(getAgencyUrl)
      const messageId: string = action.uid
      const claimRequest = yield call(
        generateClaimRequest,
        remoteDid,
        indyClaimOffer
      )

      try {
        const apiData = {
          claimRequest,
          agencyUrl,
          userPairwiseDid,
          responseMsgId: messageId,
        }
        const sendClaimRequestStatus = yield call(sendClaimRequestApi, apiData)
        yield put(claimRequestSuccess(action.uid))
      } catch (e) {
        // TODO: Need to know what to do if claim request fails
        // sending claim request failed, what to do now?
        yield put(claimRequestFail(action.uid, e))
      }
    } catch (e) {
      // generation of claim request failed, what to do now?
      yield put(claimRequestFail(action.uid, e))
    }
  } else {
    yield put(
      claimRequestFail(action.uid, {
        code: 'OCS-002',
        message: 'No pairwise connection found',
      })
    )
  }
}

function* watchClaimOfferAccepted() {
  yield takeLatest(CLAIM_OFFER_ACCEPTED, claimOfferAccepted)
}

export function* watchClaimOffer(): Generator<*, *, *> {
  yield all([watchClaimOfferAccepted()])
}

export default function claimOfferReducer(
  state: ClaimOfferStore = claimOfferInitialState,
  action: ClaimOfferAction
) {
  switch (action.type) {
    case CLAIM_OFFER_RECEIVED:
      return {
        ...state,
        [action.payloadInfo.uid]: {
          ...action.payload,
          ...action.payloadInfo,
          status: CLAIM_OFFER_STATUS.RECEIVED,
          claimRequestStatus: CLAIM_REQUEST_STATUS.NONE,
          error: null,
        },
      }
    case CLAIM_OFFER_SHOWN:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.SHOWN,
        },
      }
    case CLAIM_OFFER_ACCEPTED:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.ACCEPTED,
        },
      }
    case CLAIM_OFFER_IGNORED:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.IGNORED,
        },
      }
    case CLAIM_OFFER_REJECTED:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.REJECTED,
        },
      }
    case SEND_CLAIM_REQUEST:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus: CLAIM_REQUEST_STATUS.SENDING_CLAIM_REQUEST,
        },
      }
    case CLAIM_REQUEST_SUCCESS:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus: CLAIM_REQUEST_STATUS.CLAIM_REQUEST_SUCCESS,
        },
      }
    case CLAIM_REQUEST_FAIL:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus: CLAIM_REQUEST_STATUS.CLAIM_REQUEST_FAIL,
        },
      }
    default:
      return state
  }
}
