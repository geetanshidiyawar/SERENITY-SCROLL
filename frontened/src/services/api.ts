import {
  BackendInterventionResponse,
  BackendRequestPayload,
  LanguageKey,
} from '../types';

import { DEMO_INTERVENTIONS } from '../data/demoData';

const BACKEND_API_URL =
  'http://localhost:8000/intervention';

export interface InterventionResult {
  data: BackendInterventionResponse;
  isDemo: boolean;
  error?: string;
}

/**
 * Sends the selected language and intervention context
 * to the real Serenity FastAPI backend.
 *
 * Backend flow:
 *
 * React
 *   ↓
 * FastAPI /intervention
 *   ↓
 * Gemini
 *   ↓
 * ElevenLabs
 *   ↓
 * audio_url
 *   ↓
 * React
 *
 * Demo Mode is preserved as a fallback so the frontend
 * does not break if the backend is unavailable.
 */
export async function generateIntervention(
  payload: BackendRequestPayload,
  forceDemo: boolean = false
): Promise<InterventionResult> {

  /*
   * ----------------------------------------
   * DEMO MODE
   * ----------------------------------------
   *
   * Used when the frontend explicitly requests
   * demo mode.
   */
  if (forceDemo) {
    await new Promise<void>((resolve) =>
      setTimeout(resolve, 600)
    );

    const lang: LanguageKey =
      payload.language || 'english';

    const fallback =
      DEMO_INTERVENTIONS[lang] ||
      DEMO_INTERVENTIONS.english;

    return {
      data: fallback,
      isDemo: true,
    };
  }

  /*
   * ----------------------------------------
   * REAL BACKEND
   * ----------------------------------------
   */

  try {
    console.log(
      'SERENITY: Sending intervention request...'
    );

    console.log(
      'SERENITY: Language:',
      payload.language
    );

    const controller =
      new AbortController();

    /*
     * Gemini + ElevenLabs may take several
     * seconds, so allow up to 30 seconds.
     */
    const timeoutId =
      setTimeout(() => {
        controller.abort();
      }, 120000);

    const response =
      await fetch(
        BACKEND_API_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            payload
          ),

          signal: controller.signal,
        }
      );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Backend responded with status: ${response.status}`
      );
    }

    const json =
      (await response.json()) as
        BackendInterventionResponse;

    console.log(
      'SERENITY: Backend response received:',
      json
    );

    return {
      data: json,
      isDemo: false,
    };

  } catch (err: unknown) {

    console.error(
      'SERENITY: Backend request failed:',
      err
    );

    /*
     * ----------------------------------------
     * GRACEFUL DEMO FALLBACK
     * ----------------------------------------
     *
     * If FastAPI is not running, the frontend
     * remains usable instead of crashing.
     */
    await new Promise<void>((resolve) =>
      setTimeout(resolve, 500)
    );

    const lang: LanguageKey =
      payload.language || 'english';

    const fallback =
      DEMO_INTERVENTIONS[lang] ||
      DEMO_INTERVENTIONS.english;

    let errorMessage =
      'Backend currently offline. Active in demo mode.';

    if (
      err instanceof DOMException &&
      err.name === 'AbortError'
    ) {
      errorMessage =
        'The Serenity backend took too long to respond. Active in demo mode.';
    } else if (
      err instanceof Error
    ) {
      errorMessage =
        `${err.message} Active in demo mode.`;
    }

    console.info(
      'SERENITY: Using local demo intervention.'
    );

    return {
      data: fallback,
      isDemo: true,
      error: errorMessage,
    };
  }
}