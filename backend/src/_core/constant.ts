import pino from "pino";
import { env } from "../env";

export const LOGGER = pino({ level: env.LOG_LEVEL });

const VERSION = "0.1.0";

export const API_INFO = {
  title: "Charity Connect",
  description: "The Charity Connect backend from SmartLayer Network.",
  version: VERSION,
};

export const LOGO = `
  ____ _   _    _    ____  ___ _______   __   ____ ___  _   _ _   _ _____ ____ _____ 
 / ___| | | |  / \\  |  _ \\|_ _|_   _\\ \\ / /  / ___/ _ \\| \\ | | \\ | | ____/ ___|_   _|
| |   | |_| | / _ \\ | |_) || |  | |  \\ V /  | |  | | | |  \\| |  \\| |  _|| |     | |  
| |___|  _  |/ ___ \\|  _ < | |  | |   | |   | |__| |_| | |\\  | |\\  | |__| |___  | |  
 \\____|_| |_/_/   \\_|_| \\_|___| |_|   |_|    \\____\\___/|_| \\_|_| \\_|_____\\____| |_V ${VERSION}
`;
