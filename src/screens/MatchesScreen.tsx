import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { useFavorites } from '../hooks/useFavorites';
import { useMatches } from '../hooks/useMatches';
import { FILTERS, MatchFilter, matchesFilter, sortByStart } from '../utils/matches';

const EMPTY_TEXT: Record<MatchFilter, string> = {
  all: 'В этом туре пока нет матчей',
  upcoming: 'Предстоящих матчей нет',
  finished: 'Завершённых матчей пока нет',
};

// Экран «Матчи тура».
export function MatchesScreen() {
  const { matches, round, error, loading, refreshing, updatedAt, reload } = useMatches();
  const { favorites, isFavorite, toggle } = useFavorites();
  const [filter, setFilter] = useState<MatchFilter>('all');

  const visibleMatches = useMemo(
    () => sortByStart((matches ?? []).filter((match) => matchesFilter(match, filter))),
    [matches, filter],
  );

  const title = round != null ? `Матчи ${round}-го тура` : 'Матчи тура';

  if (loading && !matches) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.hint}>Загружаем матчи…</Text>
      </View>
    );
  }

  if (!matches) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Не удалось загрузить матчи</Text>
        {error && <Text style={styles.hint}>{error}</Text>}
        <Pressable style={styles.button} onPress={reload} accessibilityRole="button">
          <Text style={styles.buttonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.toolbar}>
        {updatedAt && <UpdatedAgo since={updatedAt} />}
        <Pressable
          style={[styles.button, refreshing && styles.buttonDisabled]}
          onPress={reload}
          disabled={refreshing}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{refreshing ? 'Обновляем…' : 'Обновить'}</Text>
        </Pressable>
      </View>

      {/* Обновление не удалось, но старые данные остаются на экране. */}
      {error && <Text style={styles.inlineError}>Не удалось обновить: {error}</Text>}

      <View style={styles.filters}>
        {FILTERS.map(({ value, label }) => {
          const selected = value === filter;
          return (
            <Pressable
              key={value}
              style={[styles.filter, selected && styles.filterSelected]}
              onPress={() => setFilter(value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={visibleMatches}
        keyExtractor={(match) => match.id}
        extraData={favorites}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            favorite={isFavorite(item.id)}
            onToggleFavorite={() => toggle(item.id)}
          />
        )}
        refreshing={refreshing}
        onRefresh={reload}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>{EMPTY_TEXT[filter]}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  inlineError: {
    color: '#b91c1c',
    fontSize: 13,
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterText: {
    fontSize: 14,
    color: '#374151',
  },
  filterTextSelected: {
    color: '#fff',
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 32,
  },
});
