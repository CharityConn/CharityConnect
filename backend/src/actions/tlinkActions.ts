import { Contract, ethers } from 'ethers'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { Action } from '../_core/type'
import { CHAIN_ID, PASS_CONTRACT, serverProvider } from '../constant'

export const handleTlinkGetAction: Action = {
  path: '/charity',
  method: 'get',
  options: {
    schema: {
      response: {
        200: z.object({
          type: z.literal('action'),
          icon: z.string(),
          label: z.string(),
          title: z.string(),
          description: z.string(),
          links: z.object({
            actions: z.array(
              z.object({
                label: z.string(),
                href: z.string(),
              }),
            ),
          }),
        }),
      },
    },
  },
  handler: tlinkGetHandler,
}

async function tlinkGetHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const account: string | undefined = (request.query as any).account

  let hasMinted = false
  if (account) {
    try {
      const contract = new Contract(
        PASS_CONTRACT,
        [
          {
            constant: true,
            inputs: [{ name: '_owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: 'balance', type: 'uint256' }],
            type: 'function',
          },
        ],
        serverProvider,
      )
      const balance = await contract.balanceOf(account)
      hasMinted = BigInt(balance) > 0n
    } catch (error) {
      console.error('Error checking mint status:', error)
    }
  }

  const payload = {
    type: 'action',
    icon: 'https://www.charityconnect.io/assets/images/charity-connect-og.png',
    label: hasMinted ? 'Already Claimed' : 'Claim',
    title: hasMinted ? 'Already Claimed' : 'Claim',
    description: hasMinted
      ? 'You have already claimed your free pass.'
      : 'Claim your free pass',
    links: {
      actions: hasMinted
        ? []
        : [
            {
              label: 'Claim',
              href: `/actions/charity/claim`,
            },
          ],
    },
  }

  return reply.status(200).send(payload)
}

export const handleTlinkClaimAction: Action = {
  path: '/charity/claim',
  method: 'post',
  options: {
    schema: {
      response: {
        200: z.object({
          chainId: z.string(),
          transactionData: z.object({
            from: z.string(),
            to: z.string(),
            data: z.string(),
          }),
        }),
      },
    },
  },
  handler: tlinkClaimHandler,
}

async function tlinkClaimHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const account: string | undefined = (request.body as any).account

  if (!account) {
    return reply.status(400).send('Missing account in request body')
  }

  try {
    const contractInterface = new ethers.Interface([
      {
        inputs: [],
        name: 'claim',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ])
    const data = contractInterface.encodeFunctionData('claim', [])

    const responseData = {
      chainId: CHAIN_ID.toString(),
      transactionData: {
        from: account,
        to: PASS_CONTRACT,
        data: data,
      },
    }

    return reply.status(200).send(responseData)
  } catch (err) {
    return reply.status(400).send('An unknown error occurred')
  }
}
