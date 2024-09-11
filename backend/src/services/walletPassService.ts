import { eq } from 'drizzle-orm';
import { CHAIN_ID, PASS_CONTRACT, TOKEN_EXPLORER_URL } from '../constant';
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

export async function getPassByPassId(dbService: DbService, passId: string) {
  const result = await dbService
    .db()
    .select({
      id: passes.id,
      googleId: passes.googleId,
      appleId: passes.appleId,
    })
    .from(passes)
    .where(eq(passes.passId, passId))
    .limit(1);

  return result.length ? result[0] : undefined;
}

export function externalId(platform: 'google' | 'apple', passId: string) {
  return `charityconnect-${platform}-${passId}-${PASS_CONTRACT}`;
}

export function decodeExternalId(externalId: string) {
  const parts = externalId.split('-');
  return {
    platform: parts[1] as 'google' | 'apple',
    passId: parts[2],
  };
}

export function buildAppleCreatePayload(passId: string) {
  const charityConnectUrl = `${env.FRONTEND_URL_ROOT}/?chain=${CHAIN_ID}&contract=${PASS_CONTRACT}&tokenId=${passId}`;
  const tokenExplorerUrl = `${TOKEN_EXPLORER_URL}/nft/${PASS_CONTRACT}/${passId}`;
  const id = externalId('apple', passId);

  return {
    templateId: env.PASS_TEMPLATE_ID,
    platform: 'apple',
    barcode: {
      redirect: {
        url: tokenExplorerUrl,
      },
      altText: 'Charity Connect Pass',
    },
    externalId: id,
    pass: {
      description: 'Charity Connect',
      backFields: [
        {
          key: 'note',
          value: 'Please refresh your pass to update your points.',
        },
        {
          key: 'website',
          label: 'Link',
          attributedValue: `<a href='${charityConnectUrl}'>Charity Connect</a>`,
          value: 'Charity Connect',
        },
      ],
      headerFields: [
        {
          label: 'DONATIONS',
          textAlignment: 'PKTextAlignmentRight',
          key: 'donations',
          value: '0',
        },
      ],
      primaryFields: [],
      secondaryFields: [
        {
          label: 'TOKEN ID',
          textAlignment: 'PKTextAlignmentLeft',
          key: 'tokenId',
          value: passId,
        },
        {
          label: 'NETWORK',
          textAlignment: 'PKTextAlignmentLeft',
          key: 'network',
          value: 'Ethereum',
        },
      ],
    },
  };
}

export function buildAppleUpdatePayload(
  passId: string,
  notificationMsg: string,
  totalDonations?: string
) {
  const charityConnectUrl = `${env.FRONTEND_URL_ROOT}/?chain=${CHAIN_ID}&contract=${PASS_CONTRACT}&tokenId=${passId}`;
  const tokenExplorerUrl = `${TOKEN_EXPLORER_URL}/nft/${PASS_CONTRACT}/${passId}`;

  const payload: any = {
    pass: {
      backFields: [
        {
          key: 'note',
          value: 'Please refresh your pass to update your donation amount.',
        },
        {
          key: 'website',
          label: 'Link',
          attributedValue: `<a href='${charityConnectUrl}'>Charity Connect</a>`,
          value: 'Charity Connect',
        },
        {
          key: 'notification',
          label: 'Latest Notification',
          value: notificationMsg,
          changeMessage: '%@',
          textAlignment: 'PKTextAlignmentNatural',
        },
      ],
      primaryFields: [],
      secondaryFields: [
        {
          label: 'TOKEN ID',
          textAlignment: 'PKTextAlignmentLeft',
          key: 'tokenId',
          value: passId,
        },
        {
          label: 'NETWORK',
          textAlignment: 'PKTextAlignmentLeft',
          key: 'network',
          value: 'Ethereum',
        },
      ],
    },
  };

  if (totalDonations) {
    payload.pass.headerFields = [
      {
        label: 'DONATIONS',
        textAlignment: 'PKTextAlignmentRight',
        key: 'donations',
        value: totalDonations,
      },
    ];
  }

  return payload;
}

export function buildGoogleCreatePayload(passId: string) {
  const charityConnectUrl = `${env.FRONTEND_URL_ROOT}/?chain=${CHAIN_ID}&contract=${PASS_CONTRACT}&tokenId=${passId}`;
  const tokenExplorerUrl = `${TOKEN_EXPLORER_URL}/nft/${PASS_CONTRACT}/${passId}`;
  const id = externalId('google', passId);

  return {
    templateId: env.PASS_TEMPLATE_ID,
    platform: 'google',
    barcode: {
      redirect: {
        url: tokenExplorerUrl,
      },
      altText: 'Charity Connect Pass',
    },
    externalId: id,
    pass: {
      logo: {
        sourceUri: {
          uri: 'https://resources.smartlayer.network/wallet-pass/charity-connect/logo.png',
        },
      },
      heroImage: {
        sourceUri: {
          uri: 'https://resources.smartlayer.network/wallet-pass/charity-connect/hero.png',
        },
      },
      linksModuleData: {
        uris: [
          {
            description: 'Charity Connect',
            id: 'website',
            uri: charityConnectUrl,
          },
        ],
      },
      hexBackgroundColor: '#ffffff',
      cardTitle: {
        defaultValue: {
          language: 'en',
          value: 'Charity Connect',
        },
      },
      subheader: {
        defaultValue: {
          language: 'en',
          value: 'Donations',
        },
      },
      header: {
        defaultValue: {
          language: 'en',
          value: '0',
        },
      },
      textModulesData: [
        {
          id: 'tokenId',
          header: 'Token ID',
          body: passId,
        },
        {
          id: 'network',
          header: 'Network',
          body: 'Ethereum',
        },
      ],
    },
  };
}

export function buildGoogleUpdatePayload(
  passId: string,
  notificationMsg: string,
  totalDonations?: string
) {
  const charityConnectUrl = `${env.FRONTEND_URL_ROOT}/?chain=${CHAIN_ID}&contract=${PASS_CONTRACT}&tokenId=${passId}`;
  const tokenExplorerUrl = `${TOKEN_EXPLORER_URL}/nft/${PASS_CONTRACT}/${passId}`;

  const payload: any = {
    message: {
      header: 'Charity Connect',
      body: notificationMsg,
      id: `${totalDonations || 'onlyMsg'}-${Date.now()}`,
      message_type: 'TEXT_AND_NOTIFY',
    },
    pass: {
      logo: {
        sourceUri: {
          uri: 'https://resources.smartlayer.network/wallet-pass/charity-connect/logo.png',
        },
      },
      heroImage: {
        sourceUri: {
          uri: 'https://resources.smartlayer.network/wallet-pass/charity-connect/hero.png',
        },
      },
      linksModuleData: {
        uris: [
          {
            description: 'Charity Connect',
            id: 'website',
            uri: charityConnectUrl,
          },
        ],
      },
      hexBackgroundColor: '#ffffff',
      cardTitle: {
        defaultValue: {
          language: 'en',
          value: 'Charity Connect',
        },
      },
      subheader: {
        defaultValue: {
          language: 'en',
          value: 'Donations',
        },
      },
      textModulesData: [
        {
          id: 'tokenId',
          header: 'Token ID',
          body: passId,
        },
        {
          id: 'network',
          header: 'Network',
          body: 'Ethereum',
        },
      ],
    },
  };

  if (totalDonations) {
    payload.pass = {
      ...payload.pass,
      header: {
        defaultValue: {
          language: 'en',
          value: totalDonations,
        },
      },
    };
  }

  return payload;
}
