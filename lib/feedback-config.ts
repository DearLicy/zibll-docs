/**
 * Public URL of the stateless GitHub App bot. It is injected at build time so
 * the Pages bundle never contains an App ID, private key, or installation token.
 */
export const feedbackEndpoint =
  process.env.NEXT_PUBLIC_FEEDBACK_ENDPOINT?.trim() || '';
