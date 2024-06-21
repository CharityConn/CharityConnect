import axios from 'axios';
import { env } from '../env';
import { LOGGER } from '../_core/constant';
import { externalId } from './walletPassService';

const logger = LOGGER.child({ from: 'commonApi' });

export async function enqueueWalletPassCreation(
  passId: string,
  params: any,
  platform: 'google' | 'apple'
) {
  const callbackUrl = `${env.CALLBACK_URL_ROOT}/webhooks/wallet-pass-created`;
  if (platform === 'google') {
    return await axios.post(
      `${env.COMMON_API}/wallet-passes`,
      {
        id: externalId('google', passId),
        callbackUrl,
        params,
      },
      {
        headers: {
          'x-stl-key': env.PROJECT_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
  } else if (platform === 'apple') {
    return await axios.post(
      `${env.COMMON_API}/wallet-passes`,
      {
        id: externalId('apple', passId),
        callbackUrl,
        params,
      },
      {
        headers: {
          'x-stl-key': env.PROJECT_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
  } else {
    throw new Error('Invalid platform');
  }
}

export async function enqueueWalletPassUpdate(id: string | null, params: any) {
  return await axios.put(
    `${env.COMMON_API}/wallet-passes`,
    {
      id,
      params,
    },
    {
      headers: {
        'x-stl-key': env.PROJECT_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function sendMail(
  email: string,
  subject: string,
  templateUrl: string,
  params: any
) {
  logger.info('enqueue %s email for %s', templateUrl.split('/').pop(), email);
  return await axios.post(
    `${env.COMMON_API}/mails`,
    {
      email,
      subject,
      templateUrl,
      params,
    },
    {
      headers: {
        'x-stl-key': env.PROJECT_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function bulkSendMail(
  bulkData: {
    email: string;
    subject: string;
    templateUrl: string;
    params: any;
  }[]
) {
  return await axios.post(`${env.COMMON_API}/mails/bulk`, bulkData, {
    headers: {
      'x-stl-key': env.PROJECT_API_KEY,
      'Content-Type': 'application/json',
    },
  });
}
