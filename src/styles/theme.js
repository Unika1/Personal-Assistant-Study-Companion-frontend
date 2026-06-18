// frontend/src/styles/theme.js
// Shared design tokens for PASC.
//
// Every new page imports from here so the whole app looks like one product:
// the same purple-to-blue brand colours, the same rounded white cards, the
// same soft shadows. These values were taken from the existing AccountPage and
// ChatPage so the new pages match what was already designed.

// Core brand colours.
export const colors = {
  primary: '#6C3FC5',        // PASC purple
  primaryDark: '#4f46e5',    // deep indigo used in some gradients
  accent: '#4A90D9',         // PASC blue
  brandGradient: 'linear-gradient(135deg, #6C3FC5 0%, #4A90D9 100%)',

  // Backgrounds.
  pageBg: 'linear-gradient(135deg, #f8f5ff 0%, #eef2ff 100%)',
  cardBg: '#ffffff',
  softBg: '#f8fafc',

  // Text.
  heading: '#111827',
  body: '#374151',
  muted: '#6b7280',

  // Status colours (used for correct/wrong and weak/strong topics).
  success: '#16a34a',
  successBg: '#ecfdf5',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  warning: '#d97706',
  warningBg: '#fffbeb',

  border: '#e5e7eb',
};

// Reusable building-block styles. Spread these into a page's style objects,
// e.g. style={{ ...card, padding: 24 }}.
export const card = {
  background: colors.cardBg,
  borderRadius: 24,
  padding: 24,
  boxShadow: '0 16px 40px rgba(16, 24, 40, 0.08)',
  border: '1px solid rgba(108, 63, 197, 0.08)',
};

export const primaryButton = {
  border: 'none',
  background: colors.brandGradient,
  color: '#ffffff',
  padding: '12px 18px',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 12px 24px rgba(108, 63, 197, 0.2)',
};

export const secondaryButton = {
  border: '1px solid rgba(108, 63, 197, 0.18)',
  background: '#f8f5ff',
  color: colors.primary,
  padding: '12px 18px',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

export const input = {
  width: '100%',
  border: `1px solid ${colors.border}`,
  background: '#fafafa',
  borderRadius: 14,
  padding: '12px 14px',
  fontSize: '0.98rem',
  outline: 'none',
};

export const pageShell = {
  minHeight: 'calc(100vh - 60px)',
  background: colors.pageBg,
  padding: '32px 20px',
};

export const contentWidth = {
  maxWidth: 980,
  margin: '0 auto',
};

// A small coloured badge, used for difficulty and mastery labels.
// Pass one of: 'easy' | 'medium' | 'hard' | 'beginner' | 'developing' | 'strong'.
export function badgeStyle(level) {
  // Map each label to a background + text colour.
  const map = {
    easy: { background: colors.successBg, color: colors.success },
    beginner: { background: colors.dangerBg, color: colors.danger },
    medium: { background: colors.warningBg, color: colors.warning },
    developing: { background: colors.warningBg, color: colors.warning },
    hard: { background: '#eef2ff', color: colors.primaryDark },
    strong: { background: colors.successBg, color: colors.success },
  };

  const chosen = map[level] || { background: colors.softBg, color: colors.muted };

  return {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'capitalize',
    ...chosen,
  };
}
