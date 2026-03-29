export async function requestPushPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

export function getPushPermissionStatus():
  | NotificationPermission
  | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}
