import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  TOPICS,
  TOTAL_STEPS,
  pathForTopic,
  topicByNumber,
  type Step,
} from '../data/curriculum';

export type Tab = 'learn' | 'mypath' | 'resources';

/** Result of an end-of-world quiz attempt, keyed by topic number. */
export interface TopicQuizResult {
  score: number;
  total: number;
  passed: boolean;
  at: number;
}

export interface Note {
  id: string;
  stepId: string;
  stepTitle: string;
  text: string;
  at: number;
}

interface Cursor {
  topic: number; // 1-based topic number
  step: number; // 0-based index within the topic
}

interface AppState {
  tab: Tab;
  setTab: (t: Tab) => void;

  cursor: Cursor;
  jumpTo: (c: Partial<Cursor>) => void;

  completed: string[];
  isCompleted: (id: string) => boolean;
  complete: (id: string) => void;

  bookmarks: string[];
  toggleBookmark: (id: string) => void;

  notes: Note[];
  addNote: (n: Omit<Note, 'id' | 'at'>) => void;

  /** Latest quiz result per topic number. */
  topicQuizzes: Record<number, TopicQuizResult>;
  saveTopicQuiz: (topicNumber: number, r: Omit<TopicQuizResult, 'at'>) => void;

  /** Consecutive days (today or yesterday back through an unbroken run) with at
      least one step completed. Stays alive through "today" even before today
      has any activity of its own, so it survives the whole day rather than
      dropping to zero the moment the calendar rolls over. */
  streak: number;

  /** Derived view of where the learner currently is. */
  current: {
    topic: ReturnType<typeof topicByNumber>;
    steps: Step[];
    path: ReturnType<typeof pathForTopic>;
  };

  totalSteps: number;
  advance: () => void;
}

const STORAGE_KEY = 'boring-way:v2';

interface Persisted {
  cursor: Cursor;
  completed: string[];
  bookmarks: string[];
  notes: Note[];
  topicQuizzes: Record<number, TopicQuizResult>;
  /** One entry per calendar day (local, "YYYY-MM-DD") that had a completed
      step, deduplicated. The streak is derived from this rather than stored
      as its own number, so it can't drift out of sync with the days it's
      supposedly counting. */
  activeDays: string[];
}

const DEFAULTS: Persisted = {
  cursor: { topic: 1, step: 0 },
  completed: [],
  bookmarks: [],
  notes: [],
  topicQuizzes: {},
  activeDays: [],
};

/** Local calendar day, not UTC -- a streak that flips at UTC midnight would
    break mid-evening for anyone west of Greenwich. */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/** Walks back from today one day at a time counting hits. Today itself is
    allowed to be a miss without breaking the streak -- the day isn't over --
    so the walk starts at yesterday if today has nothing yet. */
function computeStreak(activeDays: string[]): number {
  if (activeDays.length === 0) return 0;
  const set = new Set(activeDays);
  const cursor = new Date();
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return { ...DEFAULTS, ...parsed, cursor: { ...DEFAULTS.cursor, ...parsed.cursor } };
  } catch {
    return DEFAULTS;
  }
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>('learn');
  const [state, setState] = useState<Persisted>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — progress just won't persist */
    }
  }, [state]);

  const jumpTo = useCallback((c: Partial<Cursor>) => {
    setState((s) => {
      const topic = c.topic ?? s.cursor.topic;
      const topicData = topicByNumber(topic);
      /* Moving to a different topic resets to its first step unless told otherwise. */
      const requested = c.step ?? (c.topic && c.topic !== s.cursor.topic ? 0 : s.cursor.step);
      /* Upper bound is steps.length, not steps.length - 1: that position is the
         end-of-world quiz. */
      const step = Math.min(Math.max(requested, 0), topicData.steps.length);
      return { ...s, cursor: { topic, step } };
    });
  }, []);

  const complete = useCallback((id: string) => {
    setState((s) => {
      if (s.completed.includes(id)) return s;
      const today = dayKey(new Date());
      const activeDays = s.activeDays.includes(today) ? s.activeDays : [...s.activeDays, today];
      return { ...s, completed: [...s.completed, id], activeDays };
    });
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(id)
        ? s.bookmarks.filter((x) => x !== id)
        : [...s.bookmarks, id],
    }));
  }, []);

  const saveTopicQuiz = useCallback(
    (topicNumber: number, r: Omit<TopicQuizResult, 'at'>) => {
      setState((s) => ({
        ...s,
        topicQuizzes: { ...s.topicQuizzes, [topicNumber]: { ...r, at: Date.now() } },
      }));
    },
    [],
  );

  const addNote = useCallback((n: Omit<Note, 'id' | 'at'>) => {
    setState((s) => ({
      ...s,
      notes: [{ ...n, id: `note-${Date.now()}`, at: Date.now() }, ...s.notes],
    }));
  }, []);

  /** Step the cursor forward one step, rolling into the next topic. */
  const advance = useCallback(() => {
    setState((s) => {
      const { topic, step } = s.cursor;
      const topicData = topicByNumber(topic);
      /* `<=` so the step after the last one is the quiz. */
      if (step + 1 <= topicData.steps.length) {
        return { ...s, cursor: { topic, step: step + 1 } };
      }
      if (topic + 1 <= TOPICS.length) {
        return { ...s, cursor: { topic: topic + 1, step: 0 } };
      }
      return s;
    });
  }, []);

  const value = useMemo<AppState>(() => {
    const topic = topicByNumber(state.cursor.topic);
    return {
      tab,
      setTab,
      cursor: state.cursor,
      jumpTo,
      completed: state.completed,
      isCompleted: (id) => state.completed.includes(id),
      complete,
      bookmarks: state.bookmarks,
      toggleBookmark,
      notes: state.notes,
      addNote,
      topicQuizzes: state.topicQuizzes,
      saveTopicQuiz,
      streak: computeStreak(state.activeDays),
      current: {
        topic,
        steps: topic.steps,
        path: pathForTopic(topic.number),
      },
      totalSteps: TOTAL_STEPS,
      advance,
    };
  }, [tab, state, jumpTo, complete, toggleBookmark, addNote, saveTopicQuiz, advance]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
