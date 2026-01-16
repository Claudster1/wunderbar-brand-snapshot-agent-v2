// app/dashboard/components/ReportHistoryCard.tsx

type Props = {
  title: string;
  date: string;
  status: string;
  upgrade?: string;
};

export function ReportHistoryCard({ title, date, status, upgrade }: Props) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{date}</p>
      <p>Status: {status}</p>

      <div className="actions">
        <button>View</button>
        <button>Download PDF</button>

        {upgrade && (
          <button>
            Continue with {upgrade}
          </button>
        )}
      </div>
    </div>
  );
}
