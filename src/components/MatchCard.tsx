import { StyleSheet, Text, View } from 'react-native';
import type { Match } from '../types';
import { formatStart, statusLabel } from '../utils/matches';
import { FavoriteButton } from './FavoriteButton';

type Props = {
  match: Match;
  favorite: boolean;
  onToggleFavorite: () => void;
};

// Карточка матча: команды, счёт, время начала и статус.
export function MatchCard({ match, favorite, onToggleFavorite }: Props) {
  const { home, away, score } = match;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.meta}>{formatStart(match.startsAt)}</Text>
        <FavoriteButton active={favorite} onPress={onToggleFavorite} />
      </View>

      <View style={styles.teams}>
        <Text style={styles.team} numberOfLines={2}>
          {home.name}
        </Text>
        <Text style={styles.score}>{score ? `${score.home} : ${score.away}` : '– : –'}</Text>
        <Text style={[styles.team, styles.awayTeam]} numberOfLines={2}>
          {away.name}
        </Text>
      </View>

      <Text style={[styles.status, match.status === 'live' && styles.live]}>
        {statusLabel(match)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: 13,
    color: '#6b7280',
  },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  team: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  awayTeam: {
    textAlign: 'right',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 64,
    textAlign: 'center',
  },
  status: {
    fontSize: 13,
    color: '#374151',
  },
  live: {
    color: '#ef3124',
    fontWeight: '600',
  },
});
