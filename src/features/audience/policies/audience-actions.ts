export function canModerateAudienceUser(
  canManage: boolean,
  currentReaderId: string,
  targetReaderId: string,
): boolean {
  return (
    canManage &&
    currentReaderId.length > 0 &&
    currentReaderId !== targetReaderId
  );
}
