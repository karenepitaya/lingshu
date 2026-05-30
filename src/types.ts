export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 encoding string
  url?: string; // Client-side object URL for preview
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  isAudioPlaying?: boolean;
  activeModule?: "diet" | "exercise" | "mental" | "wellness" | "surprise";
  attachments?: Attachment[];
  choices?: string[];                   // Chatflow 选择项
  chatflowConversationId?: string;      // Chatflow 会话 ID，用于续接
}

export type ModuleType = "diet" | "exercise" | "mental" | "wellness" | "surprise";

export interface ShichenInfo {
  name: string;      // e.g., "子时"
  timeRange: string; // e.g., "23:00 - 01:00"
  organ: string;     // e.g., "胆经" (Gallbladder Meridian)
  status: string;    // e.g., "骨髓造血，胆经潜藏"
  advice: string;    // Wellness action
  acupoint: {
    name: string;    // e.g., "涌泉穴"
    location: string;// localization descriptive guide
    benefits: string;// usage health benefits
  };
  herbalTea: {
    name: string;    // Tea recipe title
    ingredients: string; // ingredients required
    effect: string;  // benefits
  };
  tips: string[];    // general lifestyle advice list
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string;
  category: "tea" | "sleep" | "exercise" | "meditation" | "water";
  description: string;
  completed: boolean;
  isCustom?: boolean;
}

