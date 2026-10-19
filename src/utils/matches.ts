import type { Match } from '../types';

export type MatchFilter = 'all' | 'upcoming' | 'finished';

export const FILTERS: { value: MatchFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'finished', label: 'Завершённые' },
];

// «Предстоящие» — всё, что ещё не доиграно: запланированные, идущие сейчас
// и перенесённые (матч ещё будет сыгран). Незнакомый статус ни в одну группу
// не относим, такой матч виден только во вкладке «Все».
const UPCOMING_STATUSES: readonly string[] = ['scheduled', 'live', 'postponed'];

export function matchesFilter(match: Match, filter: MatchFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'upcoming':
      return UPCOMING_STATUSES.includes(match.status);
    case 'finished':
      return match.status === 'finished';
  }
}

// По времени начала; матчи без даты — в конце.
export function sortByStart(matches: Match[]): Match[] {
  const time = (match: Match) => {
    const ms = match.startsAt ? Date.parse(match.startsAt) : NaN;
    return Number.isNaN(ms) ? Infinity : ms;
  };
  return [...matches].sort((a, b) => time(a) - time(b));
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Запланирован',
  live: 'Идёт',
  finished: 'Завершён',
  postponed: 'Перенесён',
};

export function statusLabel(match: Match): string {
  const label = STATUS_LABELS[match.status] ?? match.status;
  return match.status === 'live' && match.minute != null ? `${label} · ${match.minute}′` : label;
}

// Дата и время в часовом поясе устройства: Date сам переводит UTC из ISO-строки в локальное время.
export function formatStart(startsAt: string | null): string {
  if (!startsAt) return 'Дата уточняется';
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return 'Дата уточняется';
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
