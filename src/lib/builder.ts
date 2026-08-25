import type { LanguageCode, OccasionId, TemplateInfo, TemplateStyle, ThemeColors } from '@/data';
import { OCCASIONS, TEMPLATES, EFFECTS, FEATURES, MUSIC, STYLE_OPTIONS } from '@/data';

export interface BuilderContent { [key: string]: string }
export interface BuilderMedia { photos: string[]; videoUrl: string; }
export interface EventItem { id: string; name: string; date: string; time: string; venue: string; description: string; }

export interface BuilderState {
  occasion: OccasionId;
  templateId: string;
  style: TemplateStyle;
  effectIds: string[];
  content: BuilderContent;
  media: BuilderMedia;
  musicId: string;
  languages: LanguageCode[];
  featureIds: string[];
  sections: string[];
  events: EventItem[];
  savedId?: string;
  updatedAt?: number;
}

export function defaultBuilderState(): BuilderState {
  return {
    occasion: 'wedding',
    templateId: 'wedding-1',
    style: 'elegant',
    effectIds: ['curtain'],
    content: { ...OCCASIONS.find((o) => o.id === 'wedding')?.defaultContent },
    media: { photos: [], videoUrl: '' },
    musicId: '',
    languages: ['en'],
    featureIds: ['rsvp', 'gallery', 'share'],
    sections: ['cover', 'greeting', 'event', 'gallery', 'message', 'venue', 'rsvp', 'closing'],
    events: [],
  };
}

export function createBuilderState(template: TemplateInfo | undefined): BuilderState {
  if (!template) return defaultBuilderState();
  const occasionInfo = OCCASIONS.find((o) => o.id === template.occasion);
  return {
    ...defaultBuilderState(),
    occasion: template.occasion,
    templateId: template.id,
    style: template.style,
    content: { ...template.defaultContent, ...occasionInfo?.defaultContent },
    effectIds: [...template.effects],
    featureIds: [...template.features],
    sections: [...template.sections],
  };
}

export function getTemplate(state: BuilderState): TemplateInfo | undefined {
  return TEMPLATES.find((t) => t.id === state.templateId);
}

export function getTheme(state: BuilderState): ThemeColors {
  const template = getTemplate(state);
  return template?.theme ?? { primary: '#9f3c5b', secondary: '#c58a3e', accent: '#d4a23a', background: '#fff8f5', surface: '#f0d8d6', text: '#3d1f2a', textLight: '#7a5560' };
}

export function getOccasionInfo(state: BuilderState) {
  return OCCASIONS.find((o) => o.id === state.occasion);
}

export function getCompleteness(state: BuilderState): { percent: number; checklist: { label: string; done: boolean }[] } {
  const occasionInfo = getOccasionInfo(state);
  const checks = [
    { label: 'Occasion selected', done: Boolean(state.occasion) },
    { label: 'Template selected', done: Boolean(state.templateId) },
    { label: 'Event details added', done: Boolean(state.content.name || state.content.eventName || state.content.festivalName) },
    { label: 'Date added', done: Boolean(state.content.date) },
    { label: 'Venue added', done: Boolean(state.content.venue) },
    { label: 'Message added', done: Boolean(state.content.message) },
    { label: 'Photos added', done: state.media.photos.length > 0 },
    { label: 'Music selected', done: Boolean(state.musicId) },
    { label: 'Effects selected', done: state.effectIds.length > 0 },
    { label: 'Language selected', done: state.languages.length > 0 },
  ];
  const percent = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
  return { percent, checklist: checks };
}

export function surpriseMe(): BuilderState {
  const occasion = OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)];
  const templates = TEMPLATES.filter((t) => t.occasion === occasion.id);
  const template = templates[Math.floor(Math.random() * templates.length)];
  const allEffects = EFFECTS;
  const numEffects = 1 + Math.floor(Math.random() * 3);
  const effectIds: string[] = [];
  while (effectIds.length < numEffects) {
    const e = allEffects[Math.floor(Math.random() * allEffects.length)];
    if (!effectIds.includes(e.id)) effectIds.push(e.id);
  }
  const allFeatures = FEATURES;
  const numFeatures = 2 + Math.floor(Math.random() * 4);
  const featureIds: string[] = [];
  while (featureIds.length < numFeatures) {
    const f = allFeatures[Math.floor(Math.random() * allFeatures.length)];
    if (!featureIds.includes(f.id)) featureIds.push(f.id);
  }
  const music = MUSIC[Math.floor(Math.random() * MUSIC.length)];
  const styles = STYLE_OPTIONS;
  const style = styles[Math.floor(Math.random() * styles.length)];
  return {
    ...defaultBuilderState(),
    occasion: occasion.id,
    templateId: template.id,
    style,
    effectIds,
    featureIds,
    musicId: music.id,
    content: { ...occasion.defaultContent },
    sections: [...template.sections],
  };
}

export function generateId(): string {
  return `FL-2026-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function validateState(state: BuilderState): string[] {
  const errors: string[] = [];
  const occasionInfo = getOccasionInfo(state);
  if (!state.occasion) errors.push('Please select an occasion.');
  if (!state.templateId) errors.push('Please select a template.');
  if (occasionInfo) {
    for (const field of occasionInfo.contentFields) {
      if (field.required && !state.content[field.key]) {
        errors.push(`${field.label} is required.`);
      }
    }
  }
  if (state.media.videoUrl && !isValidUrl(state.media.videoUrl)) {
    errors.push('Video URL is not a valid link.');
  }
  return errors;
}

function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

export function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'));
}
