import { Share } from "@capacitor/share";

/**
 * Shares the game results using the native share sheet if supported.
 * Falls back to copying the text to the clipboard if native sharing is not available.
 * 
 * @param text The text content to share or copy.
 * @param title Optional title for the share modal.
 * @returns Promise<boolean> Returns true if shared natively, and false if copied to the clipboard.
 */
export async function shareGameResults(text: string, title?: string): Promise<boolean> {
  try {
    const canShareResult = await Share.canShare();
    if (canShareResult.value) {
      await Share.share({ text, title });
      return true;
    }
  } catch (error) {
    // Fail silently/debug and fall back to clipboard
    console.debug("Capacitor Share not available or failed:", error);
  }

  try {
    await navigator.clipboard.writeText(text);
    return false;
  } catch (clipboardError) {
    console.error("Clipboard copy failed:", clipboardError);
    return false;
  }
}
