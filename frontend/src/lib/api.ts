const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface DiagnosisResult {
  disease_class: string;
  bbox_coords: [number, number, number, number];
  severity_index: number;
  severity_level: number;
  severity_label: string;
  confidence: number;
  grad_cam_heatmap: string;
  risk_score: number;
  daily_risk_scores: number[];
  image_hash: string;
}

// ── Water Stress (separate model, separate image) ──
export interface WaterStressResult {
  water_stress_class: string;
  water_stress_level: string;
  water_stress_level_fr: string;
  water_stress_level_ar: string;
  water_stress_class_id: number;
  water_stress_confidence: number;
}

export interface HistoryItem {
  id: number;
  disease_class: string;
  confidence: number;
  severity_level: number;
  severity_index: number;
  risk_score: number;
  governorate: string;
  timestamp: string;
}

export interface ChatHistoryItem {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function analyzeImage(
  file: File,
  governorate = 'Unknown',
  delegation = ''
): Promise<DiagnosisResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('governorate', governorate);
  if (delegation) formData.append('delegation', delegation);

  const res = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to analyze image');
  }

  return res.json();
}

// ── Water Stress API (tree/plant image) ──
export async function analyzeWaterStress(file: File): Promise<WaterStressResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/analyze-water-stress`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to analyze water stress');
  }

  return res.json();
}

export async function sendChatMessage(
  question: string,
  context?: any,
  conversationId?: string
) {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      question,
      diagnosis_context: context,
      conversation_id: conversationId || null,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to send message');
  }

  return res.json();
}

export async function getDiagnosisHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_URL}/history/diagnoses`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) return [];
  return res.json();
}

export interface ConversationMessage {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
}

export interface Conversation {
  conversation_id: string;
  first_question: string;
  message_count: number;
  last_timestamp: string;
  messages: ConversationMessage[];
}

export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/history/conversations`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) return [];
  return res.json();
}

export interface GovernorateStats {
  governorate: string;
  total_events: number;
  avg_severity: number;
  avg_risk_score: number;
  dominant_disease: string;
  epidemiological_intensity: number;
}

export interface DashboardStats {
  period_start: string;
  period_end: string;
  governorate_stats: GovernorateStats[];
  national_total: number;
  active_alerts: number;
  regions_monitored: number;
  registered_farmers: number;
}

export async function getDashboardStats(days = 30): Promise<DashboardStats | null> {
  const res = await fetch(`${API_URL}/dashboard/stats?days=${days}`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) return null;
  return res.json();
}
