export type Locale = 'en' | 'nl'

const translations = {
  // Layout
  'layout.rights': {
    en: 'All rights reserved.',
    nl: 'Alle rechten voorbehouden.',
  },

  // Password Reset
  'passwordReset.preview': {
    en: 'Reset your Plexaris password',
    nl: 'Herstel je Plexaris-wachtwoord',
  },
  'passwordReset.heading': {
    en: 'Reset your password',
    nl: 'Herstel je wachtwoord',
  },
  'passwordReset.greeting': {
    en: 'Hi {userName},',
    nl: 'Hoi {userName},',
  },
  'passwordReset.body': {
    en: 'We received a request to reset your Plexaris password. Click the button below to choose a new password.',
    nl: 'We hebben een verzoek ontvangen om je Plexaris-wachtwoord te herstellen. Klik op de knop hieronder om een nieuw wachtwoord te kiezen.',
  },
  'passwordReset.button': {
    en: 'Reset Password',
    nl: 'Wachtwoord herstellen',
  },
  'passwordReset.disclaimer': {
    en: 'If you didn\u2019t request a password reset, you can safely ignore this email. The link will expire in 1 hour.',
    nl: 'Als je geen wachtwoordherstel hebt aangevraagd, kun je deze e-mail veilig negeren. De link verloopt over 1 uur.',
  },

  // Welcome
  'welcome.preview': {
    en: 'Welcome to Plexaris, {userName}!',
    nl: 'Welkom bij Plexaris, {userName}!',
  },
  'welcome.heading': {
    en: 'Welcome to Plexaris',
    nl: 'Welkom bij Plexaris',
  },
  'welcome.greeting': {
    en: 'Hi {userName},',
    nl: 'Hoi {userName},',
  },
  'welcome.body': {
    en: 'Thanks for signing up for Plexaris. We\u2019re excited to have you on board. Get started by signing in to your account.',
    nl: 'Bedankt voor je aanmelding bij Plexaris. We zijn blij dat je erbij bent. Ga aan de slag door in te loggen op je account.',
  },
  'welcome.button': {
    en: 'Sign In',
    nl: 'Inloggen',
  },
  'welcome.help': {
    en: 'If you have any questions, just reply to this email. We\u2019re here to help.',
    nl: 'Heb je vragen? Beantwoord deze e-mail. We helpen je graag.',
  },

  // User Invite
  'invite.preview': {
    en: '{invitedByName} invited you to join {organizationName}',
    nl: '{invitedByName} heeft je uitgenodigd voor {organizationName}',
  },
  'invite.heading': {
    en: 'You\u2019ve been invited',
    nl: 'Je bent uitgenodigd',
  },
  'invite.body': {
    en: '{invitedByName} has invited you to join {organizationName} as a {roleName}.',
    nl: '{invitedByName} heeft je uitgenodigd om lid te worden van {organizationName} als {roleName}.',
  },
  'invite.cta': {
    en: 'Click the button below to accept the invitation and get started.',
    nl: 'Klik op de knop hieronder om de uitnodiging te accepteren.',
  },
  'invite.button': {
    en: 'Accept Invitation',
    nl: 'Uitnodiging accepteren',
  },
  'invite.disclaimer': {
    en: 'If you weren\u2019t expecting this invitation, you can safely ignore this email.',
    nl: 'Als je deze uitnodiging niet verwachtte, kun je deze e-mail veilig negeren.',
  },

  // Suggestion Found
  'suggestion.preview': {
    en: 'New suggestion for {organizationName}: {suggestionLabel}',
    nl: 'Nieuwe suggestie voor {organizationName}: {suggestionLabel}',
  },
  'suggestion.heading': {
    en: 'New Suggestion Found',
    nl: 'Nieuwe suggestie gevonden',
  },
  'suggestion.greeting': {
    en: 'Hi {userName},',
    nl: 'Hoi {userName},',
  },
  'suggestion.body': {
    en: 'A new suggestion has been found for {organizationName}.',
    nl: 'Er is een nieuwe suggestie gevonden voor {organizationName}.',
  },
  'suggestion.action': { en: 'Action:', nl: 'Actie:' },
  'suggestion.target': { en: 'Target:', nl: 'Doel:' },
  'suggestion.confidence': { en: 'Confidence:', nl: 'Betrouwbaarheid:' },
  'suggestion.source': { en: 'Source:', nl: 'Bron:' },
  'suggestion.action.create': { en: 'Create', nl: 'Aanmaken' },
  'suggestion.action.update': { en: 'Update', nl: 'Bijwerken' },
  'suggestion.action.update_field': {
    en: 'Update field',
    nl: 'Veld bijwerken',
  },
  'suggestion.button': {
    en: 'Review Suggestion',
    nl: 'Suggestie bekijken',
  },
  'suggestion.disclaimer': {
    en: 'You\u2019re receiving this because you have email notifications enabled for suggestions.',
    nl: 'Je ontvangt dit bericht omdat je e-mailmeldingen hebt ingeschakeld voor suggesties.',
  },
} satisfies Record<string, Record<Locale, string>>

type TranslationKey = keyof typeof translations

export function t(
  key: TranslationKey,
  locale: Locale,
  vars?: Record<string, string>,
): string {
  const template = translations[key][locale] ?? translations[key].en
  if (!vars) return template
  return Object.entries(vars).reduce(
    (result, [k, v]) => result.replaceAll(`{${k}}`, v),
    template,
  )
}
