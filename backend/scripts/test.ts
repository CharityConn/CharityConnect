import axios from 'axios';
import dotenv from 'dotenv';
import {InfuraProvider, Wallet} from 'ethers';
import {readFileSync} from 'fs';

dotenv.config();

const TEST_WALLET70_SK = process.env.TEST_WALLET70_SK || '';
const TEST_WALLETD1_SK = process.env.TEST_WALLETD1_SK || '';
const TEST_ROOT = 'http://127.0.0.1:3006';
// const TEST_ROOT = 'https://sln-nodes-server.autographnft.io';

// https://sln-nodes-server.autographnft.io/json-rpc

async function uploadAttestation(
  by: 'attester' | 'subject',
  sk: string,
  filename: string
) {
  const wallet = new Wallet(sk, new InfuraProvider(11155111));
  const attLocation = `/Users/foxgem/projects/AW/sln-nodes/attestation/server/test-data/${filename}`;
  const attestation = readFileSync(attLocation, 'utf8');
  return await axios.post(`${TEST_ROOT}/attestations`, {
    by,
    attestation,
    signature: await wallet.signMessage(attestation),
  });
}

uploadAttestation('attester', TEST_WALLET70_SK, 'eas.3d1.1')
  .then(response => {
    console.log('attester upload should be success', response.status);
  })
  .catch(error => {
    console.error(error.response.data);
  });

// uploadAttestation('subject', TEST_WALLET70_SK, 'eas.3d1')
//   .then(response => {
//     console.log('subject upload should be failed', response.status);
//   })
//   .catch(error => {
//     console.error(error.response.data);
//   });

uploadAttestation('subject', TEST_WALLETD1_SK, 'eas.3d1.2')
  .then(response => {
    console.log('subject upload should be success', response.status);
  })
  .catch(error => {
    console.error(error.response.status, error.response.data);
  });

uploadAttestation('subject', TEST_WALLETD1_SK, 'eas.3d1.3')
  .then(response => {
    console.log('subject upload should be success', response.status);
  })
  .catch(error => {
    console.error(error.response.status, error.response.data);
  });
