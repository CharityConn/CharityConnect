import { CHAIN_ID, PASS_CONTRACT } from '../constant';
import { env } from '../env';

export function externalId(platform: 'google' | 'apple', tokenId: string) {
  return `charityconnect-${platform}-${tokenId}`;
}

export function decodeExternalId(externalId: string) {
  const parts = externalId.split('-');
  return {
    platform: parts[1] as 'google' | 'apple',
    tokenId: parts[2],
  };
}

export function buildAppleWalletPassPayload(tokenId: string) {
  const charityConnectUrl = `${env.FRONTEND_URL_ROOT}/?chain=${CHAIN_ID}&contract=${PASS_CONTRACT}#card=battle&tokenId=${tokenId}`;
  const id = externalId('apple', tokenId);

  return {
    id,
    params: {
      templateId: env.PASS_TEMPLATE_ID,
      platform: 'apple',
      barcode: {
        redirect: {
          url: charityConnectUrl,
        },
        altText: 'CharityConnect Pass',
      },
      externalId: id,
      pass: {
        description: 'CharityConnect',
        backFields: [
          {
            key: 'note',
            value: 'Please refresh your pass to update your points.',
          },
          {
            key: 'website',
            label: 'CharityConnect',
            value: charityConnectUrl,
          },
        ],
        headerFields: [
          {
            label: 'POINTS',
            textAlignment: 'PKTextAlignmentCenter',
            key: 'points',
            value: 0,
          },
        ],
        primaryFields: [
          {
            label: 'No.',
            textAlignment: 'PKTextAlignmentCenter',
            key: 'tokenId',
            value: tokenId,
          },
        ],
        secondaryFields: [],
      },
    },
    callbackUrl: `${env.CALLBACK_URL_ROOT}/webhooks/wallet-pass-created`,
  };
}

export function buildGoogleWalletPassPayload(tokenId: string) {
  const charityConnectUrl = `${env.FRONTEND_URL_ROOT}/?chain=${CHAIN_ID}&contract=${PASS_CONTRACT}#card=battle&tokenId=${tokenId}`;
  const id = externalId('google', tokenId);

  return {
    id,
    params: {
      templateId: env.PASS_TEMPLATE_ID,
      platform: 'google',
      barcode: {
        redirect: {
          url: charityConnectUrl,
        },
        altText: 'CharityConnect Pass',
      },
      externalId: id,
      pass: {
        logo: {
          sourceUri: {
            uri: 'https://resources.smartlayer.network/wallet-pass/v1/favicon.ico',
          },
        },
        heroImage: {
          sourceUri: {
            uri: 'https://resources.smartlayer.network/wallet-pass/v1/hero.png',
          },
        },
        linksModuleData: {
          uris: [
            {
              description: 'CharityConnect',
              id: 'website',
              uri: charityConnectUrl,
            },
          ],
        },
        hexBackgroundColor: '#000000',
        cardTitle: {
          defaultValue: {
            language: 'en',
            value: 'CharityConnect Pass',
          },
        },
        subheader: {
          defaultValue: {
            language: 'en',
            value: 'No.',
          },
        },
        header: {
          defaultValue: {
            language: 'en',
            value: tokenId,
          },
        },
        textModulesData: [
          {
            id: 'oneMiddle',
            header: 'POINTS',
            body: 0,
          },
        ],
      },
    },
    callbackUrl: `${env.CALLBACK_URL_ROOT}/webhooks/wallet-pass-created`,
  };
}
