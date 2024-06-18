import { CHAIN_ID, PASS_CONTRACT } from '../constant';
import { passes } from '../domain/schemas/passes';
import { env } from '../env';
import { DbService } from '../_core/services/dbService';

export async function updateWalletPassId(
  dbService: DbService,
  passId: string,
  platform: 'google' | 'apple',
  id: string
) {
  const walletPassAttribute =
    platform === 'google' ? { googleId: id } : { appleId: id };

  return await dbService
    .db()
    .insert(passes)
    .values({
      passId,
      ...walletPassAttribute,
    })
    .onConflictDoUpdate({
      target: [passes.passId],
      set: walletPassAttribute,
    });
}

export function externalId(platform: 'google' | 'apple', passId: string) {
  return `charityconnect-${platform}-${passId}`;
}

export function decodeExternalId(externalId: string) {
  const parts = externalId.split('-');
  return {
    platform: parts[1] as 'google' | 'apple',
    passId: parts[2],
  };
}

export function buildAppleWalletPassPayload(passId: string) {
  const charityConnectUrl = `${env.FRONTEND_URL_ROOT}/?chain=${CHAIN_ID}&contract=${PASS_CONTRACT}#card=battle&tokenId=${passId}`;
  const id = externalId('apple', passId);

  return {
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
          key: 'passId',
          value: passId,
        },
      ],
      secondaryFields: [],
    },
  };
}

export function buildGoogleWalletPassPayload(passId: string) {
  const charityConnectUrl = `${env.FRONTEND_URL_ROOT}/?chain=${CHAIN_ID}&contract=${PASS_CONTRACT}#card=battle&tokenId=${passId}`;
  const id = externalId('google', passId);

  return {
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
          value: passId,
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
  };
}