// Статусы, которые встречаются в данных. С сервера может прийти и другой —
// экран должен такой матч показать, а не потерять.
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

export type Team = {
  id: string;
  name: string;
  city: string;
};

export type Score = {
  home: number;
  away: number;
};

export type Match = {
  id: string;
  // ISO-строка в UTC; null — дата ещё не назначена (например, перенесённый матч).
  startsAt: string | null;
  status: MatchStatus;
  // Минута матча, есть только у идущих.
  minute?: number;
  home: Team;
  away: Team;
  // null — матч ещё не начался или не состоялся.
  score: Score | null;
};

export type MatchesResponse = {
  round: number;
  matches: Match[];
};
