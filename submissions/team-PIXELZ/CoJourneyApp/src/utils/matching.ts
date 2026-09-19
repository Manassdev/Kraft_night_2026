import { Journey, MatchFactor, MatchResult, User } from '../types';

/**
 * Clean and normalize text for simple location comparison
 */
function normalizeText(text: string): string {
  return (text || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Parse time strings like "5:00 PM", "17:00", "5:30 pm", "8:00 AM" into minutes of day
 */
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3] ? match[3].toLowerCase() : null;

  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Rule-based Deterministic Matching Algorithm
 * Destination: 30%
 * Route overlap: 25%
 * Time: 20%
 * Preferences: 10%
 * Trust: 10%
 * History: 5%
 * Total: 100%
 */
export function calculateJourneyMatch(
  targetJourney: Partial<Journey>,
  candidateJourney: Journey,
  currentUser?: Partial<User>
): MatchResult {
  const reasons: string[] = [];
  const factors: MatchFactor[] = [];

  const targetDest = normalizeText(targetJourney.to || '');
  const candDest = normalizeText(candidateJourney.to || '');
  const targetFrom = normalizeText(targetJourney.from || '');
  const candFrom = normalizeText(candidateJourney.from || '');

  // 1. Destination Match (30 pts max)
  let destScore = 0;
  if (targetDest && candDest) {
    if (targetDest === candDest) {
      destScore = 30;
      reasons.push('Same destination');
    } else if (targetDest.includes(candDest) || candDest.includes(targetDest)) {
      destScore = 24;
      reasons.push('Nearby destination area');
    } else {
      destScore = 8;
    }
  } else {
    destScore = 20;
  }
  factors.push({
    label: 'Destination',
    score: destScore,
    maxScore: 30,
    description: destScore >= 24 ? 'High destination alignment' : 'Moderate destination distance',
  });

  // 2. Route Overlap (25 pts max)
  let routeScore = 0;
  const sameOrigin = targetFrom === candFrom && targetFrom !== '';
  if (sameOrigin && destScore >= 24) {
    routeScore = 25;
    reasons.push('Over 85% route overlap');
  } else if (sameOrigin) {
    routeScore = 20;
    reasons.push('Same departure point');
  } else if (
    targetFrom.includes(candFrom) ||
    candFrom.includes(targetFrom) ||
    targetDest.includes(candFrom) ||
    candDest.includes(targetFrom)
  ) {
    routeScore = 18;
    reasons.push('Along the same travel corridor');
  } else {
    routeScore = 14;
    reasons.push('Route overlaps along primary transit route');
  }
  factors.push({
    label: 'Route Overlap',
    score: routeScore,
    maxScore: 25,
    description: `${Math.round((routeScore / 25) * 100)}% route compatibility`,
  });

  // 3. Time Proximity (20 pts max)
  const targetMinutes = parseTimeToMinutes(targetJourney.time || '');
  const candMinutes = parseTimeToMinutes(candidateJourney.time || '');
  const diffMinutes = Math.abs(targetMinutes - candMinutes);

  let timeScore = 0;
  if (diffMinutes <= 15) {
    timeScore = 20;
    reasons.push(`Close departure time (±${diffMinutes} mins)`);
  } else if (diffMinutes <= 30) {
    timeScore = 16;
    reasons.push(`Similar travel window (±${diffMinutes} mins)`);
  } else if (diffMinutes <= 60) {
    timeScore = 12;
    reasons.push('Within 1 hour departure');
  } else {
    timeScore = 8;
  }
  factors.push({
    label: 'Travel Time',
    score: timeScore,
    maxScore: 20,
    description: `Difference: ${diffMinutes} minutes`,
  });

  // 4. Preferences Match (10 pts max)
  let prefScore = 10;
  if (candidateJourney.companionPreference && candidateJourney.companionPreference !== 'Any') {
    const userGender = currentUser?.gender || 'Male';
    if (candidateJourney.companionPreference === userGender) {
      prefScore = 10;
      reasons.push(`Matches ${candidateJourney.companionPreference} companion preference`);
    } else {
      prefScore = 4;
    }
  } else {
    prefScore = 10;
    reasons.push('Flexible cooperation preference');
  }
  factors.push({
    label: 'Preferences',
    score: prefScore,
    maxScore: 10,
    description: 'Compatible travel preferences',
  });

  // 5. Trust Score (10 pts max)
  const candTrust = candidateJourney.userTrustScore || 80;
  const trustScore = Math.round((Math.min(candTrust, 100) / 100) * 10);
  if (candidateJourney.userVerified) {
    reasons.push('Verified community member');
  }
  if (candTrust >= 90) {
    reasons.push('Highly trusted traveler');
  }
  factors.push({
    label: 'Trust & Reputation',
    score: trustScore,
    maxScore: 10,
    description: `${candTrust}/100 community trust`,
  });

  // 6. History / Past Cooperation (5 pts max)
  const historyScore = currentUser && currentUser.completedJourneys && currentUser.completedJourneys > 3 ? 5 : 4;
  if (historyScore === 5) {
    reasons.push('Strong cooperation track record');
  }
  factors.push({
    label: 'Cooperation History',
    score: historyScore,
    maxScore: 5,
    description: 'Active community participant',
  });

  const rawTotal = destScore + routeScore + timeScore + prefScore + trustScore + historyScore;
  const matchPercentage = Math.min(99, Math.max(45, rawTotal));

  return {
    journey: candidateJourney,
    matchPercentage,
    reasons,
    factors,
  };
}

/**
 * Score and sort candidate journeys by compatibility with target journey
 */
export function findJourneyMatches(
  targetJourney: Partial<Journey>,
  allJourneys: Journey[],
  currentUser?: Partial<User>
): MatchResult[] {
  return allJourneys
    .filter(j => j.id !== targetJourney.id && j.userId !== currentUser?.id)
    .map(candidate => calculateJourneyMatch(targetJourney, candidate, currentUser))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}
