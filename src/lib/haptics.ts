import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Triggers a light tap (impact) haptic feedback.
 * Safe to call on all platforms; fails silently on standard web browsers.
 */
export async function triggerLightTap(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    // Fail silently when Capacitor is not initialized or on unsupported platform
  }
}

/**
 * Triggers a success notification haptic feedback.
 * Safe to call on all platforms; fails silently on standard web browsers.
 */
export async function triggerSuccessHaptic(): Promise<void> {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (error) {
    // Fail silently when Capacitor is not initialized or on unsupported platform
  }
}

/**
 * Triggers an error notification haptic feedback.
 * Safe to call on all platforms; fails silently on standard web browsers.
 */
export async function triggerErrorHaptic(): Promise<void> {
  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch (error) {
    // Fail silently when Capacitor is not initialized or on unsupported platform
  }
}
