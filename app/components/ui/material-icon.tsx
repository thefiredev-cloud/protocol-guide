"use client";

export interface MaterialIconProps {
  /** The Material Symbol icon name (e.g., "chat_bubble", "menu_book") */
  name: string;
  /** Whether to use the filled variant */
  filled?: boolean;
  /** Icon size in pixels (default: 24) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Accessibility label */
  "aria-label"?: string;
}

/**
 * Material Symbols icon component
 * Uses Google's Material Symbols Outlined font
 *
 * @see https://fonts.google.com/icons
 */
export function MaterialIcon({
  name,
  filled = false,
  size = 24,
  className = "",
  "aria-label": ariaLabel,
}: MaterialIconProps) {
  const classes = [
    "material-symbols-outlined",
    filled ? "filled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      style={{ fontSize: size }}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      aria-hidden={!ariaLabel}
    >
      {name}
    </span>
  );
}

/**
 * Icon name mapping from Lucide to Material Symbols
 * Use this for migration reference
 */
export const ICON_MAP = {
  // Navigation
  MessageCircle: "chat_bubble",
  BookOpen: "menu_book",
  History: "history",
  User: "person",
  Mic: "mic",
  MicOff: "mic_off",

  // Actions
  Search: "search",
  Send: "send",
  Plus: "add",
  X: "close",
  ChevronRight: "chevron_right",
  ChevronLeft: "chevron_left",
  ChevronDown: "expand_more",
  ChevronUp: "expand_less",
  ArrowLeft: "arrow_back",
  ArrowRight: "arrow_forward",
  MoreVertical: "more_vert",
  MoreHorizontal: "more_horiz",

  // Medical/Protocol
  Heart: "cardiology",
  Activity: "ecg_heart",
  AlertTriangle: "warning",
  AlertCircle: "error",
  Baby: "child_care",
  Pill: "medication",
  Syringe: "vaccines",
  Thermometer: "thermostat",
  Stethoscope: "stethoscope",
  Hospital: "local_hospital",
  Ambulance: "local_shipping",

  // Status
  Check: "check",
  CheckCircle: "check_circle",
  Info: "info",
  HelpCircle: "help",
  Clock: "schedule",
  Timer: "timer",

  // Files/Content
  FileText: "description",
  Bookmark: "bookmark",
  BookmarkFilled: "bookmark",
  Link: "link",
  ExternalLink: "open_in_new",
  Copy: "content_copy",
  Trash: "delete",
  Edit: "edit",

  // Settings/System
  Settings: "settings",
  Menu: "menu",
  Grid: "grid_view",
  List: "list",
  Filter: "tune",
  Refresh: "refresh",
  Download: "download",
  Upload: "upload",

  // Communication
  Phone: "call",
  Mail: "mail",
  Bell: "notifications",
  BellOff: "notifications_off",

  // Misc
  Sun: "light_mode",
  Moon: "dark_mode",
  Eye: "visibility",
  EyeOff: "visibility_off",
  Lock: "lock",
  Unlock: "lock_open",
  Wifi: "wifi",
  WifiOff: "wifi_off",
  Signal: "signal_cellular_alt",
  Battery: "battery_full",

  // AI/Smart
  Bot: "smart_toy",
  Sparkles: "auto_awesome",

  // Policy/Docs
  Policy: "policy",
  Verified: "verified",

  // Attachments
  Paperclip: "attach_file",
  Image: "image",
} as const;

export type LucideIconName = keyof typeof ICON_MAP;
export type MaterialIconName = (typeof ICON_MAP)[LucideIconName];
