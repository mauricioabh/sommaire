import { getDbConnection } from "@/lib/db";
import { pricingPlans } from "./constants";
import { currentUser, User } from "@clerk/nextjs/server";
import { getUserUploadCount } from "@/lib/summaries";

export async function getPriceIdForActiveUser(email: string) {
  const sql = await getDbConnection();
  const query =
    await sql`SELECT price_id FROM users where email = ${email} and status = 'active'`;
  return query?.[0]?.price_id || null;
}

export async function hasActivePlan(email: string) {
  const sql = await getDbConnection();
  const query =
    await sql`SELECT price_id FROM users where email = ${email} and status = 'active' AND price_id IS NOT NULL`;
  return query && query.length > 0;
}

export async function hasReachedUploadLimit(userId: string) {
  const uploadCount = await getUserUploadCount(userId);

  const user = await currentUser();
  console.log("USER: ", user);
  if (!user?.id) {
    return null;
  }
  const email = user?.emailAddresses?.[0]?.emailAddress;
  console.log("email: ", email);

  let priceId: string | null = null;
  if (email) {
    priceId = await getPriceIdForActiveUser(email);
  }

  console.log("priceId: ", priceId);
  let planName = "Buy a plan";

  const plan = pricingPlans.find((plan) => plan.priceId === priceId);

  console.log("plan: ", plan);
  if (plan) {
    planName = plan.name;
  }

  const isPro = planName === "pro";

  const uploadLimit = isPro ? 1000 : 5;

  return {
    hasReachedLimit: uploadCount >= uploadLimit,
    uploadLimit,
  };
}

export async function getSubrscriptionStatus(user: User) {
  if (!user?.id) {
    return false;
  }
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return false;
  }
  const hasSubscription = await hasActivePlan(email);
  return hasSubscription;
}
