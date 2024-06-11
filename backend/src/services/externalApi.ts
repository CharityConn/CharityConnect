// sln-a upload attestation
// sln-a find attestation by decoded
// common api send email

import axios from "axios";
import { env } from "../env";

export async function uploadSLNAttestation(
  by: string,
  signature: string,
  attestation: string
) {
  return await axios.post(
    `${env.SLN_ATTESTATION_API}/attestations`,
    {
      by,
      signature,
      attestation,
      message: attestation,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function findByDecoded(
  token: string,
  id: string,
  schemaId: string,
  message: string,
  signature: string
) {
  return await axios.get(
    `${env.SLN_ATTESTATION_API}/attestations/${token}/${id}/${schemaId}?message=${message}&signature=${signature}`,
    {
      headers: {
        "Content-Type": "application/json",
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
        "x-stl-key": env.PROJECT_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
}

export async function createOTP(otpType: string, target: string) {
  return await axios.post(
    `${env.SLN_ATTESTATION_API}/secret/otp`,
    {
      otpType,
      target,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function createIdAttest(
  id: any,
  idSignature: string,
  expireTime: number,
  signature: string,
  receiver: string
) {
  return await axios.post(
    `${env.SLN_ATTESTATION_API}/attestations/id`,
    {
      id,
      signature,
      idSignature,
      expireTime,
      message: JSON.stringify(id),
      receiver,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getRawdata(
  attester: string,
  tokenId: string,
  message: string,
  signature: string,
  chain: string
) {
  return await axios.get(
    `${env.SLN_ATTESTATION_API}/attestations/${attester}/${tokenId}/${chain}/rawdata?message=${message}&signature=${signature}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
