import React, { useState } from 'react';
import { InterventionCard } from './components/InterventionCard';
import type {
  LanguageKey,
  InterventionContent,
} from './types';
import { generateIntervention } from './services/api';

interface SerenityContext {
  trigger: boolean;
  dominantEmotion: string;
  negativeScore: number;
  contentType: string;
  contentText: string;
  pageUrl: string;
  pageTitle: string;
  timeSpentSeconds: number;
}

function getSerenityContext(): SerenityContext {
  const params = new URLSearchParams(window.location.search);

  const trigger =
    params.get('trigger') === 'true';

  const dominantEmotion =
    params.get('emotion') || '';

  const negativeScore = Number(
    params.get('negative_score') || '0'
  );

  const contentType =
    params.get('content_type') || 'unknown';

  const contentText =
    params.get('content_text') || '';

  const pageUrl =
    params.get('page_url') || '';

  const pageTitle =
    params.get('page_title') || '';

  const timeSpentSeconds = Number(
    params.get('time_spent_seconds') || '0'
  );

  return {
    trigger,
    dominantEmotion,
    negativeScore,
    contentType,
    contentText,
    pageUrl,
    pageTitle,
    timeSpentSeconds,
  };
}

function App() {
  const [serenityContext] =
    useState<SerenityContext>(
      getSerenityContext
    );

  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageKey | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [audioUrl, setAudioUrl] =
    useState<string | undefined>(undefined);

  const [intervention, setIntervention] =
    useState<InterventionContent | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /*
   * IMPORTANT:
   *
   * Serenity must NEVER call Gemini or ElevenLabs
   * unless AIML has already triggered an intervention.
   */
  const handleSelectLanguage = async (
    language: LanguageKey
  ): Promise<void> => {
    if (!serenityContext.trigger) {
      console.log(
        'SERENITY: No AIML trigger. Language intervention blocked.'
      );

      setErrorMessage(
        'No Serenity intervention is active right now.'
      );

      return;
    }

    setSelectedLanguage(language);
    setIsLoading(true);
    setAudioUrl(undefined);
    setErrorMessage(null);

    /*
     * This payload contains ONLY the REAL context
     * received from the Chrome Extension.
     *
     * There is NO hardcoded sadness.
     * There is NO hardcoded negative score.
     * There is NO fake 120-second session.
     */
    const payload = {
      page: {
        url:
          serenityContext.pageUrl ||
          'unknown',
        title:
          serenityContext.pageTitle ||
          'Serenity',
        text:
          serenityContext.contentText,
        time_spent_seconds:
          serenityContext.timeSpentSeconds,
      },

      emotion: {
        dominant_emotion:
          serenityContext.dominantEmotion,
        negative_score:
          serenityContext.negativeScore,
        content_type:
          serenityContext.contentType,
        content_text:
          serenityContext.contentText,
      },

      language,
    };

    try {
      console.log(
        '========================================'
      );

      console.log(
        'SERENITY: REAL AIML CONTEXT'
      );

      console.log(
        'Emotion:',
        serenityContext.dominantEmotion
      );

      console.log(
        'Negative score:',
        serenityContext.negativeScore
      );

      console.log(
        'Time spent:',
        serenityContext.timeSpentSeconds
      );

      console.log(
        'Language:',
        language
      );

      console.log(
        '========================================'
      );

      const result =
        await generateIntervention(
          payload
        );

      console.log(
        'SERENITY: Intervention result:',
        result
      );

      /*
       * Gemini-generated intervention.
       */
      if (result.data.intervention) {
        setIntervention(
          result.data.intervention
        );
      }

      /*
       * ElevenLabs-generated audio.
       */
      if (result.data.audio_url) {
        setAudioUrl(
          result.data.audio_url
        );

        console.log(
          'SERENITY: Real ElevenLabs audio received.'
        );
      } else {
        setErrorMessage(
          'Audio could not be generated right now.'
        );
      }

      if (result.isDemo) {
        console.warn(
          'SERENITY: Backend fallback/demo mode is active.',
          result.error
        );
      }
    } catch (error: unknown) {
      console.error(
        'SERENITY: Intervention generation failed:',
        error
      );

      setErrorMessage(
        'We could not prepare your Serenity moment right now.'
      );

      setAudioUrl(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * If Serenity was opened without a real AIML trigger,
   * DO NOT show an intervention and DO NOT call Gemini.
   */
  if (!serenityContext.trigger) {
    return (
      <div className="min-h-screen serenity-bg flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">
            🌿
          </div>

          <h1 className="text-3xl font-semibold tracking-wide text-[#26382B]">
            SERENITY
          </h1>

          <p className="mt-3 text-sm text-[#657568] leading-relaxed">
            Serenity is waiting for a genuine wellbeing
            signal from your browsing activity.
          </p>

          <p className="mt-4 text-xs text-[#718579]">
            No intervention is active right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen serenity-bg relative">
      <main className="min-h-screen flex flex-col items-center px-4 py-8">

        {/* SERENITY BRANDING */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <span
              className="text-2xl"
              aria-hidden="true"
            >
              🌿
            </span>

            <h1 className="text-3xl font-semibold tracking-wide text-[#26382B]">
              SERENITY
            </h1>
          </div>

          <p className="mt-2 text-sm text-[#657568]">
            A quiet digital retreat for your mind
          </p>
        </div>

        {/* INTERVENTION AREA */}
        {intervention ? (
          <InterventionCard
            intervention={intervention}
            audioUrl={audioUrl}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={
              handleSelectLanguage
            }
            isLoading={isLoading}
          />
        ) : (
          <div
            id="serenity-language-start"
            className="w-full max-w-2xl mx-auto my-4 p-8 rounded-3xl serenity-card text-center"
          >
            <div className="text-3xl mb-4">
              🌿
            </div>

            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#4E6B56]">
              MINDFUL PAUSE
            </p>

            <h2 className="mt-3 text-2xl font-editorial text-[#223528]">
              Take a little moment for yourself
            </h2>

            <p className="mt-4 text-sm text-[#5F7065] leading-relaxed max-w-lg mx-auto">
              You have reached a moment where a small
              reset may help. Choose your language and
              Serenity will create a personalized
              intervention for you.
            </p>

            <div className="mt-6">
              <InterventionCard
                intervention={{
                  title:
                    'A Moment to Pause',
                  message:
                    'Choose a language and Serenity will prepare your personalized moment.',
                  activity:
                    'Take a comfortable breath and give yourself a moment before continuing.',
                  duration_seconds: 120,
                }}
                audioUrl={undefined}
                selectedLanguage={
                  selectedLanguage
                }
                onSelectLanguage={
                  handleSelectLanguage
                }
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <p
            className="mt-4 max-w-lg text-xs text-[#a35c5c] text-center"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <p className="mt-6 text-xs text-[#718579] text-center">
          Take a quiet breath whenever you need.
        </p>
      </main>
    </div>
  );
}

export default App;

