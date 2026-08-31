import { source } from '@/lib/source';
import { createTokenizer } from '@orama/tokenizers/mandarin';
import { createFromSource } from 'fumadocs-core/search/server';

const search = createFromSource(source, {
  localeMap: {
    // Orama has no built-in Chinese language; keep the Mandarin tokenizer
    // scoped to zh so it does not conflict with the other locale indexes.
    zh: {
      components: {
        tokenizer: createTokenizer(),
      },
    },
    en: 'english',
    ja: 'english',
  },
  search: {
    threshold: 0,
    tolerance: 0,
  },
});

export const dynamic = 'force-static';
export const GET = search.staticGET;
