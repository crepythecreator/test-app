import { useCallback, useEffect, useRef, useState } from 'react';
import { MATCHES_URL } from '../config';
import type { Match, MatchesResponse } from '../types';

async function fetchMatches(signal: AbortSignal): Promise<MatchesResponse> {
  const response = await fetch(MATCHES_URL, { signal });
  if (!response.ok) {
    throw new Error(`Сервер ответил ${response.status}`);
  }
  const data = await response.json();
  if (!data || !Array.isArray(data.matches)) {
    throw new Error('Неожиданный формат ответа');
  }
  return data as MatchesResponse;
}

// Загрузка матчей тура.
// loading — первая загрузка (данных ещё нет), refreshing — повторная поверх уже показанных.
export function useMatches() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [round, setRound] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Последний запрос. Предыдущий отменяем, чтобы поздний ответ не перезаписал свежие данные.
  const controllerRef = useRef<AbortController | null>(null);

  const request = useCallback((controller: AbortController) => {
    controllerRef.current?.abort();
    controllerRef.current = controller;

    fetchMatches(controller.signal)
      .then((data) => {
        setMatches(data.matches);
        setRound(data.round);
        setUpdatedAt(new Date());
        setError(null);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : 'Не удалось загрузить матчи');
      })
      .finally(() => {
        if (controllerRef.current !== controller) return;
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    request(controller);
    return () => controller.abort();
  }, [request]);

  const reload = useCallback(() => {
    if (matches) setRefreshing(true);
    else setLoading(true);
    setError(null);
    request(new AbortController());
  }, [matches, request]);

  return { matches, round, error, loading, refreshing, updatedAt, reload };
}
