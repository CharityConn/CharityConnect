import { Controller, SecurityFilterRule } from './_core/type';
import {createWalletPass} from './actions/walletPassAction';

export const controllers: Controller[] = [
  {
    prefix: 'wallet-pass',
    actions: [createWalletPass],
  },
];

export const securityRules: SecurityFilterRule[] = [];
