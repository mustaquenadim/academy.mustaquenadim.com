'use server';

import type { ActionResponse, PageFeedback } from '@/components/feedback/schema';

/**
 * Handles "How is this guide?" submissions from the docs footer.
 *
 * Currently logs server-side only. Swap the body for a real sink (GitHub
 * Discussions, PostHog, Sanity, …) and return `{ githubUrl }` if the
 * submission has a public URL worth linking back to.
 */
export async function onRateAction(feedback: PageFeedback): Promise<ActionResponse> {
  console.log('[feedback]', feedback);

  return {};
}
