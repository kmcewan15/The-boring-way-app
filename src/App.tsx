import { useEffect, useState } from 'react';
import ExploreTopics from './components/ExploreTopics';
import LearnScreen from './components/LearnScreen';
import Modal from './components/Modal';
import MyPathScreen, { type MyPathRoute } from './components/MyPathScreen';
import { CompletedSteps, Notes, Timebox } from './components/MyPathDetails';
import ProgressScreen from './components/ProgressScreen';
import ResourcesScreen from './components/ResourcesScreen';
import Sidebar from './components/Sidebar';
import StepView from './components/StepView';
import TopicQuiz from './components/TopicQuiz';
import { JOURNEY, globalIndexOf } from './data/curriculum';
import { useApp } from './state/useApp';

const MODAL_LABELS: Record<MyPathRoute, string> = {
  timebox: 'Timebox',
  progress: 'My progress',
  completed: 'Completed steps',
  notes: 'My notes',
};

export default function App() {
  const { tab, cursor, complete, advance, addNote, saveTopicQuiz } = useApp();
  const [explore, setExplore] = useState(false);
  const [detail, setDetail] = useState<MyPathRoute | null>(null);
  /* Index into the flat journey, so a step from any topic can be opened. */
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const entry = openIndex === null ? null : JOURNEY[openIndex];

  /* Overlays cover the stage but not the sidebar, so a nav click while one is
     open would otherwise look like it did nothing. Dismiss them on tab change. */
  useEffect(() => {
    setDetail(null);
    setExplore(false);
    setOpenIndex(null);
  }, [tab]);

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        {tab === 'learn' && (
          <LearnScreen
            onOpenExplore={() => setExplore(true)}
            onOpenEntry={(globalIndex) => setOpenIndex(globalIndex)}
          />
        )}

        {tab === 'mypath' && (
          <div className="screen screen--scroll">
            <div className="wrap wrap--center">
              <MyPathScreen onOpen={setDetail} />
            </div>
          </div>
        )}

        {tab === 'resources' && (
          <div className="screen screen--scroll">
            <div className="wrap">
              <ResourcesScreen />
            </div>
          </div>
        )}

        {detail && (
          <Modal label={MODAL_LABELS[detail]} onClose={() => setDetail(null)}>
            {detail === 'progress' && (
              <ProgressScreen
                onOpenExplore={() => {
                  setDetail(null);
                  setExplore(true);
                }}
              />
            )}
            {detail === 'completed' && <CompletedSteps />}
            {detail === 'notes' && <Notes />}
            {detail === 'timebox' && <Timebox />}
          </Modal>
        )}

        {explore && <ExploreTopics onClose={() => setExplore(false)} />}

        {entry?.kind === 'step' && (
          <StepView
            step={entry.step}
            index={entry.indexInTopic}
            total={entry.topic.steps.length}
            topicNumber={entry.topic.number}
            biome={entry.topic.biome}
            onClose={() => setOpenIndex(null)}
            onComplete={(noteText) => {
              complete(entry.step.id);
              if (noteText) {
                addNote({ stepId: entry.step.id, stepTitle: entry.step.title, text: noteText });
              }
              /* Only move the cursor if they finished the step they were on. */
              if (openIndex === globalIndexOf(cursor.topic, cursor.step)) advance();
              /* Then open the next thing on the trail, so a run of steps costs
                 one click each. At the very end there is nothing left to open. */
              const next = (openIndex ?? 0) + 1;
              setOpenIndex(next < JOURNEY.length ? next : null);
            }}
          />
        )}

        {entry?.kind === 'quiz' && (
          <TopicQuiz
            topic={entry.topic}
            onClose={() => setOpenIndex(null)}
            onFinish={(result) => {
              saveTopicQuiz(entry.topic.number, result);
              /* Finishing the quiz you were parked on moves you into the next
                 world, which is what makes the trail carry on. */
              if (openIndex === globalIndexOf(cursor.topic, cursor.step)) advance();
            }}
            /* The quiz closes a topic, so the next entry is the first step of the
               next one. Go straight there rather than back out to the trail. */
            onNext={
              openIndex !== null && openIndex + 1 < JOURNEY.length
                ? () => setOpenIndex(openIndex + 1)
                : undefined
            }
          />
        )}
      </main>
    </div>
  );
}
