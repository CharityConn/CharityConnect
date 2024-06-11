import { and, eq } from "drizzle-orm";
import { OTP_EMAIL_TEMPLATE_URL } from "../constant";
import { idSecrets } from "../domain/schemas/idSecrets";
import { env } from "../env";
import { DbService } from "../_core/services/dbService";
import { sendMail } from "./externalApi";

export async function createAndSendEmailOtp(
  dbService: DbService,
  target: string
) {
  const sentRecently = await isSentRecently(dbService, "email", target);
  if (sentRecently) {
    return new Error("OTP has been sent recently");
  }

  const secret = generateSecret();
  // send to target
  await sendMail(target, "Your confirmation code", OTP_EMAIL_TEMPLATE_URL, {
    otp: secret,
  });
  const createAt = await upSertSecret(dbService, "email", target, secret);
  return { createAt: createAt };
}

export async function findSecretByTypeAndTarget(
  dbService: DbService,
  idType: string,
  target: string
) {
  const rows = await dbService
    .db()
    .select()
    .from(idSecrets)
    .where(and(eq(idSecrets.idType, idType), eq(idSecrets.idValue, target)))
    .limit(1);

  return rows.length ? rows[0] : undefined;
}

export async function upSertSecret(
  dbService: DbService,
  idType: string,
  idValue: string,
  secret: number
) {
  const secretRow = await findSecretByTypeAndTarget(dbService, idType, idValue);
  const createdAt = Date.now();
  if (secretRow) {
    await dbService
      .db()
      .update(idSecrets)
      .set({ secret, createdAt })
      .where(and(eq(idSecrets.idType, idType), eq(idSecrets.idValue, idValue)));
  } else {
    await dbService.db().insert(idSecrets).values({
      idType,
      idValue,
      secret,
      createdAt,
    });
  }
  return createdAt;
}

export async function verifySecret(
  dbService: DbService,
  idType: string,
  idValue: string,
  secret: number
) {
  const secretRow = await findSecretByTypeAndTarget(dbService, idType, idValue);
  if (secretRow) {
    if (
      secretRow.secret === secret &&
      Date.now() - secretRow.createdAt < env.SECRET_TTL
    ) {
      // delete secret
      return true;
    }
  }

  return false;
}

function generateSecret() {
  var buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  return Number(buf.join("").substring(3, 9));
}

const RECENT = 60 * 1000;

async function isSentRecently(
  dbService: DbService,
  idType: string,
  target: string
) {
  const secretRow = await findSecretByTypeAndTarget(dbService, idType, target);
  return secretRow && Date.now() - secretRow.createdAt < RECENT;
}
