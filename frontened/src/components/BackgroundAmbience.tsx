import React from 'react';

/**
 * Chinese-inspired Shanshui (山水) calm nature background:
 * - Misty Chinese mountain silhouettes (karst peaks, distant layered hills)
 * - Muted jade, sage, bamboo green, warm ivory, soft stone, and muted teal palette
 * - Drifting atmospheric morning mist and gentle fog ribbons
 * - Subtle bamboo stalks and pine branch silhouettes evoking a peaceful scholar's garden
 * - Calm water reflections at the base
 * - Subtle drifting bamboo leaves
 */
export const BackgroundAmbience: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* 1. Soft Morning Celestial Radiance (Warm Ivory & Pearl Mist) */}
      <div
        className="absolute -top-32 right-6 sm:right-1/4 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-radial from-[#FFF7E3]/65 via-[#F6EDE0]/35 to-transparent blur-3xl animate-celestial-glow"
      />

      {/* 2. Soft Ambient Jade Mist (Top Left) */}
      <div
        className="absolute -top-36 -left-36 w-[550px] h-[550px] rounded-full bg-radial from-[#E3F0E6]/75 via-[#EBF3EC]/35 to-transparent blur-3xl opacity-75"
      />

      {/* 3. Farthest Misty Karst Mountain Peaks (Traditional Shanshui Ink-Wash Silhouette) */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[360px] sm:h-[440px] opacity-45">
        <svg
          viewBox="0 0 1440 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Distant soaring mountain silhouettes fading into mist */}
          <path
            d="M0 320
               C80 290 140 230 200 210
               C260 190 320 250 380 230
               C450 205 510 130 580 120
               C640 110 700 180 760 195
               C830 210 880 155 940 140
               C1010 125 1070 200 1130 185
               C1190 170 1260 90 1320 100
               C1370 110 1410 160 1440 190
               V440 H0 Z"
            fill="url(#shanshuiFarPeaks)"
          />
          <defs>
            <linearGradient id="shanshuiFarPeaks" x1="720" y1="90" x2="720" y2="440" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9AB8A6" stopOpacity="0.35" />
              <stop offset="0.5" stopColor="#B8CFBF" stopOpacity="0.6" />
              <stop offset="1" stopColor="#D9E7DC" stopOpacity="0.85" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. High Atmospheric Mist Layer (Drifting between mountains) */}
      <div className="absolute bottom-48 sm:bottom-60 left-[-12%] right-[-12%] h-36 bg-gradient-to-t from-[#EAF2EC]/85 via-white/55 to-transparent blur-2xl animate-shanshui-mist opacity-85" />

      {/* 5. Midground Shanshui Mountain Ridge (Muted Jade & Stone Green Karst Peaks) */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[280px] sm:h-[340px] opacity-40">
        <svg
          viewBox="0 0 1440 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Layer of closer rolling karst peaks with steep natural contours */}
          <path
            d="M0 260
               C70 240 120 190 180 180
               C240 170 290 220 340 210
               C410 195 460 145 520 140
               C580 135 630 190 690 185
               C760 180 810 120 880 125
               C940 130 990 190 1050 180
               C1120 170 1170 130 1230 135
               C1290 140 1340 190 1390 185
               L1440 200
               V340 H0 Z"
            fill="url(#shanshuiMidPeaks)"
          />
          <defs>
            <linearGradient id="shanshuiMidPeaks" x1="720" y1="120" x2="720" y2="340" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6C8F7A" stopOpacity="0.55" />
              <stop offset="0.4" stopColor="#8BAAA0" stopOpacity="0.75" />
              <stop offset="1" stopColor="#C8DBCF" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 6. Mid-Level Rolling Fog Ribbon */}
      <div className="absolute bottom-28 sm:bottom-36 left-[-15%] right-[-15%] h-32 bg-gradient-to-t from-[#E3EDE5]/90 via-[#F3F8F5]/60 to-transparent blur-xl animate-shanshui-mist-reverse opacity-80" />

      {/* 7. Foreground Shanshui Ridge & Pine Silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[180px] sm:h-[230px] opacity-35">
        <svg
          viewBox="0 0 1440 230"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Gentle hill terrace with subtle pine canopies */}
          <path
            d="M0 175
               C50 165 90 145 130 140
               C180 135 210 155 250 150
               C300 145 340 120 390 125
               C440 130 480 150 530 145
               C580 140 620 115 670 110
               C720 105 760 130 810 125
               C860 120 900 100 950 105
               C1000 110 1040 135 1090 130
               C1140 125 1180 105 1230 110
               C1280 115 1320 140 1370 135
               L1440 145
               V230 H0 Z"
            fill="url(#shanshuiForeground)"
          />
          <defs>
            <linearGradient id="shanshuiForeground" x1="720" y1="95" x2="720" y2="230" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4A6C58" stopOpacity="0.75" />
              <stop offset="0.5" stopColor="#678A75" stopOpacity="0.88" />
              <stop offset="1" stopColor="#A4C0B0" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 8. Calm Water Base with Soft Mirror Sheen & Subtle Ripples */}
      <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-36 bg-gradient-to-t from-[#D6E6DC]/90 via-[#E4EFE7]/65 to-transparent opacity-75">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full opacity-35"
        >
          {/* Delicate water ripple lines */}
          <path d="M100 30 Q300 35 500 30 T900 32 T1300 30" stroke="#759885" strokeWidth="1" strokeDasharray="3 12" />
          <path d="M200 48 Q400 52 600 48 T1000 50 T1400 48" stroke="#87A695" strokeWidth="1" strokeDasharray="4 16" />
          <path d="M50 65 Q250 68 450 65 T850 67 T1250 65" stroke="#9AB5A6" strokeWidth="0.8" strokeDasharray="2 10" />
        </svg>
      </div>

      {/* 9. Ground Morning Mist (Hugging the water base) */}
      <div className="absolute bottom-0 left-[-10%] right-[-10%] h-20 bg-gradient-to-t from-[#DFEAE2]/95 via-[#F2F7F4]/70 to-transparent blur-lg opacity-85" />

      {/* 10. Elegant Chinese Bamboo Stalks and Leaves (Lower Left Corner Silhouette) */}
      <div className="absolute bottom-2 -left-4 sm:left-2 w-48 h-80 sm:w-60 sm:h-96 opacity-25 filter blur-[0.3px]">
        <svg viewBox="0 0 200 320" fill="none" className="w-full h-full text-[#385542]">
          {/* Bamboo Stalk 1 */}
          <path d="M40 320 L40 240 M40 236 L40 156 M40 152 L40 72 M40 68 L40 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="36" y1="238" x2="44" y2="238" stroke="currentColor" strokeWidth="3" />
          <line x1="36" y1="154" x2="44" y2="154" stroke="currentColor" strokeWidth="3" />
          <line x1="37" y1="70" x2="43" y2="70" stroke="currentColor" strokeWidth="2.5" />

          {/* Bamboo Leaves Cluster 1 */}
          <path d="M40 154 C60 145 90 150 110 165 C85 160 60 162 40 154 Z" fill="currentColor" />
          <path d="M40 154 C55 130 80 120 105 125 C80 135 60 145 40 154 Z" fill="currentColor" />
          <path d="M40 154 C50 165 75 180 95 195 C75 182 55 172 40 154 Z" fill="currentColor" />

          {/* Bamboo Leaves Cluster 2 (Higher) */}
          <path d="M40 70 C65 60 95 65 120 78 C95 75 65 78 40 70 Z" fill="currentColor" />
          <path d="M40 70 C58 48 85 40 110 44 C88 52 65 62 40 70 Z" fill="currentColor" />

          {/* Bamboo Stalk 2 (Slightly slanted) */}
          <path d="M80 320 L75 250 M75 246 L70 176 M70 172 L65 102 M65 98 L60 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="72" y1="248" x2="78" y2="248" stroke="currentColor" strokeWidth="2" />
          <line x1="67" y1="174" x2="73" y2="174" stroke="currentColor" strokeWidth="2" />
          <line x1="62" y1="100" x2="68" y2="100" stroke="currentColor" strokeWidth="2" />

          {/* Bamboo Leaves Cluster on Stalk 2 */}
          <path d="M70 174 C90 165 120 170 140 185 C115 180 90 182 70 174 Z" fill="currentColor" />
          <path d="M70 174 C88 150 115 142 135 146 C112 155 90 165 70 174 Z" fill="currentColor" />
        </svg>
      </div>

      {/* 11. Subtle Pine Needle Branch (Upper Right Silhouette - Chinese Shanshui Scholar's Pine) */}
      <div className="absolute -top-6 -right-6 sm:right-0 w-52 h-52 sm:w-64 sm:h-64 opacity-20 filter blur-[0.4px]">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#34513E]">
          {/* Main gnarled pine branch */}
          <path
            d="M200 10 C160 30 140 60 100 70 C75 75 55 90 30 110"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M140 60 C120 80 95 95 70 105"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Pine Needle Fans */}
          <g transform="translate(100, 70)">
            <path d="M0 0 L-25 -15 M0 0 L-28 -8 M0 0 L-30 0 M0 0 L-28 8 M0 0 L-22 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M0 0 L-18 -20 M0 0 L-10 -24 M0 0 L0 -26 M0 0 L10 -24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          <g transform="translate(70, 105)">
            <path d="M0 0 L-22 -12 M0 0 L-25 -5 M0 0 L-26 2 M0 0 L-22 10 M0 0 L-16 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M0 0 L-14 -18 M0 0 L-6 -20 M0 0 L3 -22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          <g transform="translate(30, 110)">
            <path d="M0 0 L-18 -10 M0 0 L-20 -3 M0 0 L-20 4 M0 0 L-16 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* 12. Gentle Floating Bamboo Leaves (Drifting with meditative cadence) */}
      {/* Bamboo Leaf 1 */}
      <div
        className="absolute top-24 left-[16%] w-7 h-4 opacity-30 select-none pointer-events-none"
        style={{ animation: 'bamboo-drift-1 14s ease-in-out infinite' }}
      >
        <svg viewBox="0 0 28 14" fill="none" className="w-full h-full text-[#496B55]">
          <path
            d="M0 7 C8 2 18 2 28 7 C18 12 8 12 0 7 Z"
            fill="currentColor"
            opacity="0.85"
          />
          <path d="M0 7 L28 7" stroke="#FAFDFB" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>

      {/* Bamboo Leaf 2 */}
      <div
        className="absolute top-60 right-[18%] w-6 h-3.5 opacity-25 select-none pointer-events-none"
        style={{ animation: 'bamboo-drift-2 16s ease-in-out infinite 2.5s' }}
      >
        <svg viewBox="0 0 28 14" fill="none" className="w-full h-full text-[#5B7D67]">
          <path
            d="M0 7 C8 1 20 1 28 7 C20 13 8 13 0 7 Z"
            fill="currentColor"
            opacity="0.8"
          />
          <path d="M0 7 L28 7" stroke="#FAFDFB" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>

      {/* Bamboo Leaf 3 */}
      <div
        className="absolute bottom-48 left-[24%] w-6 h-3 opacity-20 select-none pointer-events-none"
        style={{ animation: 'bamboo-drift-1 18s ease-in-out infinite 5s' }}
      >
        <svg viewBox="0 0 28 14" fill="none" className="w-full h-full text-[#6E8F7A]">
          <path
            d="M0 7 C8 2 18 2 28 7 C18 12 8 12 0 7 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* 13. Subtle Shanshui Rice-Paper Texture Overlay (Tactile organic warmth) */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#4C6853_1px,transparent_1px)] [background-size:38px_38px] opacity-[0.022]"
      />
    </div>
  );
};
