import axios from 'axios';
import { env } from '../env';

export async function getEligibilityStatus(wallet: string) {
  return await axios.get(`${env.LAUNCHPAD_BACKEND_URL}/redbrick/eligibility`, {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      wallet,
    },
  });
}
