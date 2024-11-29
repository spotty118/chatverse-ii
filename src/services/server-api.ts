import md5 from 'md5'
import { ofetch } from 'ofetch'
import i18n from '~app/i18n'
import { ChatError, ErrorCode } from '~utils/errors'

export interface Campaign {
  id: string
  name: string
  description: string
  code: string
  price: number
}

export interface Discount {
  id: string
  code: string
  price: number
  show: boolean
  campaign?: Campaign
  startTime: string
  endTime: string
}

export interface PurchaseInfo {
  price: number
  discount?: Discount
  campaign?: Campaign
}

export const decodePoeFormkey = async (html: string): Promise<string> => {
  return ''
}

export const createDiscount = async () => {
  return { price: 0, discount: undefined, campaign: undefined }
}

export const checkDiscount = async (params: { appOpenTimes: number; premiumModalOpenTimes: number }) => {
  return { show: false }
}

export const fetchPurchaseInfo = async (): Promise<PurchaseInfo> => {
  return { price: 0, discount: undefined, campaign: undefined }
}

export const activateLicense = async (key: string, instanceName: string) => {
  return { activated: true, instance: { id: '' }, error: '' }
}

import AddMessageBreakMutation from './graphql/AddMessageBreakMutation.graphql?raw'
import ChatViewQuery from './graphql/ChatViewQuery.graphql?raw'
import MessageAddedSubscription from './graphql/MessageAddedSubscription.graphql?raw'
import SendMessageMutation from './graphql/SendMessageMutation.graphql?raw'
import SubscriptionsMutation from './graphql/SubscriptionsMutation.graphql?raw'
import ViewerStateUpdatedSubscription from './graphql/ViewerStateUpdatedSubscription.graphql?raw'

export const GRAPHQL_QUERIES = {
  AddMessageBreakMutation,
  ChatViewQuery,
  SendMessageMutation,
  SubscriptionsMutation,
  MessageAddedSubscription,
  ViewerStateUpdatedSubscription,
}

export interface PoeSettings {
  formkey: string
  tchannelData: ChannelData
}

interface ChannelData {
  minSeq: string
  channel: string
  channelHash: string
  boxName: string
  baseHost: string
  targetUrl: string
  enableWebsocket: boolean
}

async function getFormkey() {
  const html: string = await ofetch('https://poe.com', { parseResponse: (txt) => txt })
  const formkey = await decodePoeFormkey(html)
  return formkey
}

export async function getPoeSettings(): Promise<PoeSettings> {
  const [settings, formkey] = await Promise.all([ofetch<PoeSettings>('https://poe.com/api/settings'), getFormkey()])
  console.debug('poe formkey', formkey)
  settings.formkey = formkey
  return settings
}

export interface GqlHeaders {
  formkey: string
  tchannel: string
}

export async function gqlRequest(queryName: keyof typeof GRAPHQL_QUERIES, variables: any, poeSettings: PoeSettings) {
  const query = GRAPHQL_QUERIES[queryName]
  const payload = { query, variables }
  const tagId = md5(JSON.stringify(payload) + poeSettings.formkey + 'Jb1hi3fg1MxZpzYfy')
  return ofetch('https://poe.com/api/gql_POST', {
    method: 'POST',
    body: payload,
    headers: {
      'poe-formkey': poeSettings.formkey,
      'poe-tag-id': tagId,
      'poe-tchannel': poeSettings.tchannelData.channel,
    },
  })
}

export async function getChatId(bot: string, poeSettings: PoeSettings): Promise<number> {
  const resp = await gqlRequest('ChatViewQuery', { bot }, poeSettings)
  if (!resp.data) {
    throw new ChatError(i18n.t('You need to login to Poe first'), ErrorCode.POE_UNAUTHORIZED)
  }
  return resp.data.chatOfBot.chatId
}

