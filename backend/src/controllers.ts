import { Controller, SecurityFilterRule } from './_core/type'
import { getCharities } from './actions/charitiesActions'
import {
  handleTlinkClaimAction,
  handleTlinkGetAction,
} from './actions/tlinkActions'
import { checkin } from './actions/userAction'
import {
  createWalletPass,
  getWalletPass,
  updateWalletPass,
} from './actions/walletPassAction'
import { walletPassCreated } from './actions/webhookActions'

export const controllers: Controller[] = [
  {
    prefix: 'wallet-pass',
    actions: [createWalletPass, getWalletPass, updateWalletPass],
  },
  {
    prefix: 'webhooks',
    actions: [walletPassCreated],
  },
  {
    prefix: 'user',
    actions: [checkin],
  },
  {
    prefix: 'charities',
    actions: [getCharities],
  },
  {
    prefix: 'actions',
    actions: [handleTlinkGetAction, handleTlinkClaimAction],
  },
]

export const securityRules: SecurityFilterRule[] = []
