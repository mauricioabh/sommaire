import UpgradeRequired from "@/components/common/upgrade-required";
import { getSubrscriptionStatus } from "@/utils/user";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user?.id) {
    return redirect("/sign-in");
  }

  if (user?.id) {
    const hasActiveSubscription = await getSubrscriptionStatus(user);
    console.log("hasActiveSubscription XXX", hasActiveSubscription);
    if (!hasActiveSubscription) {
      return <UpgradeRequired />;
    }
  }

  return <div>{children}</div>;
}
