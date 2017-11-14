// @flow

import type { CustomError, GenericObject } from '../common/type-common'
import type { PendingRedirection } from '../lock/type-lock'

export type NotificationPayload = {
  forDID: string,
  uid: string,
  type: string,
  senderLogoUrl?: ?string,
}

export const PUSH_NOTIFICATION_PERMISSION = 'PUSH_NOTIFICATION_PERMISSION'
export type PushNotificationPermissionAction = {
  type: typeof PUSH_NOTIFICATION_PERMISSION,
  isAllowed: boolean,
}

export const PUSH_NOTIFICATION_RECEIVED = 'PUSH_NOTIFICATION_RECEIVED'
export type PushNotificationReceivedAction = {
  type: typeof PUSH_NOTIFICATION_RECEIVED,
  notification: DownloadedNotification,
}

export const PUSH_NOTIFICATION_UPDATE_TOKEN = 'PUSH_NOTIFICATION_UPDATE_TOKEN'
export type PushNotificationUpdateTokenAction = {
  type: typeof PUSH_NOTIFICATION_UPDATE_TOKEN,
  token: string,
}

export const FETCH_ADDITIONAL_DATA = 'FETCH_ADDITIONAL_DATA'
export type FetchAdditionalDataAction = {
  type: typeof FETCH_ADDITIONAL_DATA,
  notificationPayload: NotificationPayload,
}

export const FETCH_ADDITIONAL_DATA_ERROR = 'FETCH_ADDITIONAL_DATA_ERROR'
export type FetchAdditionalDataErrorAction = {
  type: typeof FETCH_ADDITIONAL_DATA_ERROR,
  isPristine: boolean,
  isFetching: boolean,
  error: CustomError,
}

export type PushNotificationAction =
  | PushNotificationPermissionAction
  | PushNotificationReceivedAction
  | PushNotificationUpdateTokenAction
  | FetchAdditionalDataAction
  | FetchAdditionalDataErrorAction

export type DownloadedNotification = {
  additionalData: GenericObject,
  type: string,
  uid: string,
  senderLogoUrl?: ?string,
  remotePairwiseDID?: ?string,
}

export type PushNotificationStore = {
  isAllowed: boolean,
  notification: ?DownloadedNotification,
  pushToken: ?string,
  isPristine: boolean,
  isFetching: boolean,
  error: ?CustomError,
}

export type AdditionalDataResponse = {
  msgs: [
    {
      statusCode: string,
      edgeAgentPayload: string,
      typ: string,
      statusMsg: string,
      uid: string,
    },
  ],
}

export type Attribute = {
  label: string,
  data?: string,
  type?: string,
}

export type AdditionalData = {
  name: string,
  version: string,
  revealedAttributes: Array<Attribute>,
  claimDefinitionSchemaSequenceNumber: number,
}

export type AdditionalDataPayload = {
  data: AdditionalData,
  issuer: {
    name: string,
    did: string,
  },
  statusMsg?: string,
}

export type ClaimOfferPushPayload = {
  msg_type: string,
  version: string,
  to_did: string,
  from_did: string,
  iid: string,
  mid: string,
  claim: {
    name: Array<string>,
    date_of_birth: Array<string>,
    height: Array<string>,
  },
  claim_name: string,
  schema_seq_no: number,
  issuer_did: string,
  issuer_name: string,
  nonce: string,
  optional_data: GenericObject,
}

export type NotificationPayloadInfo = {
  uid: string,
  senderLogoUrl: string,
  remotePairwiseDID: string,
}

export type NextPropsPushNotificationNavigator = {
  pushNotification: {
    notification: DownloadedNotification,
  },
  notificationPayload?: ?NotificationPayload,
  currentScreen: string,
  isAppLocked: boolean,
}

export type PushNotificationNavigatorProps = {
  fetchAdditionalData: (notificationPayload: NotificationPayload) => void,
  authenticationRequestReceived: (data: DownloadedNotification) => void,
  claimOfferReceived: (payload: AdditionalDataPayload) => void,
  proofRequestReceived: (payload: AdditionalDataPayload) => void,
  addPendingRedirection: (
    pendingRedirection: Array<PendingRedirection>
  ) => void,
  navigateToRoute: (routeName: string) => void,
} & NextPropsPushNotificationNavigator

export type ClaimProofNavigation = {
  goBack: () => void,
  state: {
    params: {
      uid: string,
    },
  },
}
