import { describe, expect, it } from 'vitest';
import { groupEpisodesBySeason, parseGenres, progressPercent } from './utils';
import type { Episode } from './types';

describe('media utilities', () => {
  it('parses JSON and comma separated genres', () => {
    expect(parseGenres('["Action","Adventure"]')).toEqual(['Action', 'Adventure']);
    expect(parseGenres('Drama, Mystery')).toEqual(['Drama', 'Mystery']);
  });

  it('groups episodes by sorted season and episode number', () => {
    const episodes: Episode[] = [
      { id: 3, airedSeason: 2, airedEpisodeNumber: 1 },
      { id: 2, airedSeason: 1, airedEpisodeNumber: 2 },
      { id: 1, airedSeason: 1, airedEpisodeNumber: 1 }
    ];
    const groups = groupEpisodesBySeason(episodes);
    expect([...groups.keys()]).toEqual(['1', '2']);
    expect(groups.get('1')?.map(item => item.id)).toEqual([1, 2]);
  });

  it('clamps progress to display percentages', () => {
    expect(progressPercent({ progress: 0.4 })).toBe(40);
    expect(progressPercent({ progress: 2 })).toBe(100);
    expect(progressPercent({ progress: -1 })).toBe(0);
  });
});
