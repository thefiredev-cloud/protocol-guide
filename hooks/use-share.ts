import { Share, Platform } from "react-native";
import * as Haptics from "@/lib/haptics";

export interface ShareableProtocol {
  id: number;
  protocolNumber: string;
  protocolTitle: string;
  section: string | null;
  content: string;
  sourcePdfUrl: string | null;
}

/**
 * Share a protocol with other apps
 * Formats the protocol content for easy reading and sharing
 */
export async function shareProtocol(protocol: ShareableProtocol): Promise<boolean> {
  try {
    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Format the protocol content for sharing
    const title = protocol.protocolTitle || "EMS Protocol";
    const protocolNum = protocol.protocolNumber ? `Protocol #${protocol.protocolNumber}` : "";
    const section = protocol.section ? `Section: ${protocol.section}` : "";
    
    // Create a clean, readable message
    let message = `📋 ${title}\n`;
    if (protocolNum) message += `${protocolNum}\n`;
    if (section) message += `${section}\n`;
    message += `\n${protocol.content.slice(0, 500)}`;
    if (protocol.content.length > 500) message += "...";
    message += "\n\n— Shared via Protocol Guide";

    const result = await Share.share(
      {
        message,
        title,
      },
      {
        dialogTitle: "Share Protocol",
      }
    );

    if (result.action === Share.sharedAction) {
      // Success haptic
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error sharing protocol:", error);
    // Error haptic
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    return false;
  }
}

/**
 * Share multiple protocols (e.g., search results)
 */
export async function shareProtocolList(
  protocols: ShareableProtocol[],
  searchQuery?: string
): Promise<boolean> {
  try {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    let message = searchQuery 
      ? `📋 EMS Protocols for "${searchQuery}"\n\n`
      : "📋 EMS Protocols\n\n";

    protocols.slice(0, 5).forEach((p, i) => {
      message += `${i + 1}. ${p.protocolTitle}`;
      if (p.protocolNumber) message += ` (#${p.protocolNumber})`;
      if (p.section) message += ` - ${p.section}`;
      message += "\n";
    });

    if (protocols.length > 5) {
      message += `\n...and ${protocols.length - 5} more protocols`;
    }

    message += "\n\n— Shared via Protocol Guide";

    const result = await Share.share(
      {
        message,
        title: searchQuery ? `Protocols: ${searchQuery}` : "EMS Protocols",
      },
      {
        dialogTitle: "Share Protocols",
      }
    );

    if (result.action === Share.sharedAction) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error sharing protocols:", error);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    return false;
  }
}
