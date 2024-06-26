import pino from 'pino';
import {env} from '../env';

export const LOGGER = pino({level: env.LOG_LEVEL});

const VERSION = '0.1.0';

export const API_INFO = {
  title: 'SLN-A',
  description: 'The attestation service in SmartLayer Network.',
  version: VERSION,
};

export const LOGO = `
     _______. __      .__   __.         ___   .___________.___________. _______     _______.___________.    ___   .___________. __    ______   .__   __. 
    /       ||  |     |  \\ |  |        /   \\  |           |           ||   ____|   /       |           |   /   \\  |           ||  |  /  __  \\  |  \\ |  | 
   |   (----\`|  |     |   \\|  |       /  ^  \\ \`---|  |----\`---|  |----\`|  |__     |   (----\`---|  |----\`  /  ^  \\ \`---|  |----\`|  | |  |  |  | |   \\|  | 
    \\   \\    |  |     |  . \`  |      /  /_\\  \\    |  |        |  |     |   __|     \\   \\       |  |      /  /_\\  \\    |  |     |  | |  |  |  | |  . \`  | 
.----)   |   |  \`----.|  |\\   |     /  _____  \\   |  |        |  |     |  |____.----)   |      |  |     /  _____  \\   |  |     |  | |  \`--'  | |  |\\   | 
|_______/    |_______||__| \\__|    /__/     \\__\\  |__|        |__|     |_______|_______/       |__|    /__/     \\__\\  |__|     |__|  \\______/  |__| \\__V ${VERSION} 
`;
