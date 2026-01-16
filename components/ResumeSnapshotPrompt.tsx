// components/ResumeSnapshotPrompt.tsx
// Component for prompting user to resume or start new snapshot

interface ResumeSnapshotPromptProps {
  onResume: () => void;
  onStartNew: () => void;
}

export function ResumeSnapshotPrompt({
  onResume,
  onStartNew,
}: ResumeSnapshotPromptProps) {
  return (
    <div className="card text-center">
      <h3>Pick up where you left off?</h3>
      <p className="text-sm text-muted mt-2">
        We saved your progress so you can continue without starting over.
      </p>

      <div className="flex gap-3 justify-center mt-4">
        <button className="btn-primary" onClick={onResume}>
          Resume Snapshot
        </button>
        <button className="btn-secondary" onClick={onStartNew}>
          Start Fresh
        </button>
      </div>
    </div>
  );
}
