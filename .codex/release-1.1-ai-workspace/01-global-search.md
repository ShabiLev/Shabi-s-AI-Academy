# Global Search

Create protected `/search` and a pure `src/search` service. Index lessons/modules, user and built-in prompts/agents, projects, knowledge metadata, run summaries, help, documentation, roadmap, and changelog. Search is local, deterministic, accent-insensitive for English, Hebrew-normalized, partial and modestly typo-tolerant.

Documents contain stable ID, entity type, bilingual title/description, keywords, tags, route, availability, update time, source, and optional category. Results add score and matched fields. Ranking boosts exact phrases, titles, tags, favorites, and recency with stable ID tie-breaking. Filters cover entity type, category, language, favorite, recent, and availability. Empty queries show recent items. Highlights are text fragments, never HTML. History is bounded and versioned.

The UI provides grouped semantic results, filters that stack on narrow screens, keyboard selection, status announcements, safe empty states, and Ctrl/Cmd+Shift+F entry. Unit tests cover normalization, indexing, ranking, filters, boosts, safe highlights, malformed storage, and bounds.

## Acceptance

Search remains immediate for the shipped local dataset and performs no request.
