import { pricingPlans } from "@/utils/constants";
import { getPriceIdForActiveUser } from "@/utils/user";
import { currentUser } from "@clerk/nextjs/server";
import { Badge } from "../ui/badge";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function PlanBadge() {
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
  return (
    <Badge
      variant="outline"
      className={cn(
        "ml-2 bg-linear-to-r from-aber-100 to-amber-200 hidden lg:flex flex-row items-center",
        !priceId && "from-red-100 to-red-200 border-red-300"
      )}
    >
      <Crown
        className={cn(
          "w-3 h-3 mr-1 text-amber-600",
          !priceId && "text-red-600"
        )}
      ></Crown>
      {planName}
    </Badge>
  );
}
