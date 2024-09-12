import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Action } from '../_core/type';
import { env } from '../env';
import { isProd } from '../constant';

const CHARITY_ICON_BASE_URL = `${env.FRONTEND_URL_ROOT}/assets/icon/charities`;
const CHARITIES = isProd
  ? [
      {
        name: 'Charity Connect Foundation',
        icon: `${CHARITY_ICON_BASE_URL}/other.svg`,
      },
    ]
  : [
      {
        name: 'BoonCharity',
        icon: `${CHARITY_ICON_BASE_URL}/animal.svg`,
      },
    ];

export const getCharities: Action = {
  path: '/',
  method: 'get',
  options: {
    schema: {
      response: {
        200: z.array(
          z.object({
            name: z.string(),
            icon: z.string(),
          })
        ),
      },
    },
  },
  handler: getCharitiesHandler,
};

async function getCharitiesHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.status(200).send(CHARITIES);
}
