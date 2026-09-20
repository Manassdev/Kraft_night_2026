import { TrustScoreBreakdown, User } from '../types';

/**
 * Trust score is calculated out of 100 points:
 * - Verification: max 30
 * - Completed journeys: max 25
 * - Cooperation history: max 20
 * - Ratings: max 15
 * - Safety record: max 10
 *
 * IMPORTANT:
 * Trust score is NOT a guarantee of safety.
 * It is a cooperative community reputation indicator.
 */
export const TRUST_SCORE_DISCLAIMER =
  'Trust score is a cooperative community reputation metric and is not a safety guarantee.';

export function calculateTrustBreakdown(user: Partial<User>): TrustScoreBreakdown {
  // 1. Verification (30 pts)
  const verification = user.verified ? 30 : 0;

  // 2. Completed journeys (max 25 pts: ~2.5 pts per journey, capped at 10 journeys)
  const completedCount = user.completedJourneys || 0;
  const completedJourneys = Math.min(25, Math.round(completedCount * 2.5));

  // 3. Cooperation history (max 20 pts: ~4 pts per successful cooperation)
  const historyCount = user.cooperationHistoryCount || 0;
  const cooperationHistory = Math.min(20, Math.round(historyCount * 4));

  // 4. Ratings (max 15 pts: based on 5-star scale -> (avg / 5) * 15)
  const avgRating = user.ratingsCount && user.ratingsAverage ? user.ratingsAverage : 0;
  const ratings = Math.min(15, Math.round((avgRating / 5) * 15));

  // 5. Safety record (max 10 pts: based on clean history / reports)
  const safetyRecord = Math.min(10, user.safetyScore !== undefined ? user.safetyScore : 10);

  const total = Math.min(100, verification + completedJourneys + cooperationHistory + ratings + safetyRecord);

  let label: 'Verified' | 'Trusted' | 'New user' = 'New user';
  if (total >= 90) {
    label = 'Trusted';
  } else if (total >= 60 || user.verified) {
    label = 'Verified';
  }

  return {
    verification,
    completedJourneys,
    cooperationHistory,
    ratings,
    safetyRecord,
    total,
    label,
  };
}

export function getTrustLabel(score: number, verified: boolean): 'Verified' | 'Trusted' | 'New user' {
  if (score >= 90) return 'Trusted';
  if (score >= 60 || verified) return 'Verified';
  return 'New user';
}
