import { AudienceDetail } from "@/features/audience/components/audience-detail";
import { readSessionProfile } from "@/lib/auth/session";

export default async function AudienceUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, readSessionProfile()]);
  return (
    <AudienceDetail
      id={id}
      canManage={session.profile?.adminAccess?.role === "super_admin"}
      currentReaderId={session.profile?.id ?? ""}
    />
  );
}
