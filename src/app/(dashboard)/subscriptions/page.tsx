import { SubscriptionManager } from "@/features/subscriptions/components/subscription-manager";
import { readSessionProfile } from "@/lib/auth/session";

export default async function SubscriptionsPage() {
  const session = await readSessionProfile();
  return (
    <SubscriptionManager
      canManage={session.profile?.adminAccess?.role === "super_admin"}
    />
  );
}
