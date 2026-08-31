'use client';

type MatchInformationProps = {
  matchDate?: string | null;
  competition?: string | null;
  roundStage?: string | null;
};

function formatFullDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function MatchInformation({
  matchDate,
  competition,
  roundStage,
}: MatchInformationProps) {
  // Only show section if we have at least one piece of data
  const hasData = matchDate || competition || roundStage;

  if (!hasData) {
    return null;
  }

  return (
    <section className="mt-12 sm:mt-16 lg:mt-20">
      {/* Section eyebrow */}
      <div
        className="mb-6 text-xs font-bold uppercase tracking-widest sm:mb-8"
        style={{
          color: 'var(--fw-brand)',
          letterSpacing: '0.14em',
        }}
      >
        Match Information
      </div>

      {/* Information card */}
      <div
        className="overflow-hidden rounded-xl border"
        style={{
          background: 'var(--fw-bg-surface)',
          borderColor: 'var(--fw-border)',
        }}
      >
        {/* Desktop layout: 2 columns */}
        <div className="hidden grid-cols-2 sm:grid">
          {/* Left column */}
          <div>
            {matchDate && (
              <div
                className="flex flex-col border-b px-6 py-5"
                style={{ borderColor: 'var(--fw-border)' }}
              >
                <div
                  className="mb-1 text-xs font-bold uppercase tracking-widest"
                  style={{
                    color: 'var(--fw-text-muted)',
                    letterSpacing: '0.1em',
                  }}
                >
                  Date
                </div>
                <div
                  className="text-sm font-semibold sm:text-base"
                  style={{ color: 'var(--fw-text-primary)' }}
                >
                  {formatFullDate(matchDate)}
                </div>
              </div>
            )}

            {competition && (
              <div
                className="flex flex-col px-6 py-5"
                style={{
                  borderColor: 'var(--fw-border)',
                  ...(matchDate ? { borderTop: '1px solid var(--fw-border)' } : {}),
                }}
              >
                <div
                  className="mb-1 text-xs font-bold uppercase tracking-widest"
                  style={{
                    color: 'var(--fw-text-muted)',
                    letterSpacing: '0.1em',
                  }}
                >
                  Competition
                </div>
                <div
                  className="text-sm font-semibold sm:text-base"
                  style={{ color: 'var(--fw-text-primary)' }}
                >
                  {competition}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div
            className="border-l"
            style={{ borderColor: 'var(--fw-border)' }}
          >
            {matchDate && (
              <div
                className="flex flex-col border-b px-6 py-5"
                style={{ borderColor: 'var(--fw-border)' }}
              >
                <div
                  className="mb-1 text-xs font-bold uppercase tracking-widest"
                  style={{
                    color: 'var(--fw-text-muted)',
                    letterSpacing: '0.1em',
                  }}
                >
                  Time
                </div>
                <div
                  className="text-sm font-semibold sm:text-base"
                  style={{ color: 'var(--fw-text-primary)' }}
                >
                  {formatTime(matchDate)}
                </div>
              </div>
            )}

            {roundStage && (
              <div
                className="flex flex-col px-6 py-5"
                style={{
                  borderColor: 'var(--fw-border)',
                  ...(matchDate ? { borderTop: '1px solid var(--fw-border)' } : {}),
                }}
              >
                <div
                  className="mb-1 text-xs font-bold uppercase tracking-widest"
                  style={{
                    color: 'var(--fw-text-muted)',
                    letterSpacing: '0.1em',
                  }}
                >
                  Round
                </div>
                <div
                  className="text-sm font-semibold sm:text-base"
                  style={{ color: 'var(--fw-text-primary)' }}
                >
                  {roundStage}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile layout: 1 column or 2 columns if needed */}
        <div className="grid grid-cols-1 sm:hidden">
          {matchDate && (
            <div
              className="flex flex-col border-b px-6 py-5"
              style={{ borderColor: 'var(--fw-border)' }}
            >
              <div
                className="mb-1 text-xs font-bold uppercase tracking-widest"
                style={{
                  color: 'var(--fw-text-muted)',
                  letterSpacing: '0.1em',
                }}
              >
                Date
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: 'var(--fw-text-primary)' }}
              >
                {formatFullDate(matchDate)}
              </div>
            </div>
          )}

          {matchDate && (
            <div
              className="flex flex-col border-b px-6 py-5"
              style={{ borderColor: 'var(--fw-border)' }}
            >
              <div
                className="mb-1 text-xs font-bold uppercase tracking-widest"
                style={{
                  color: 'var(--fw-text-muted)',
                  letterSpacing: '0.1em',
                }}
              >
                Time
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: 'var(--fw-text-primary)' }}
              >
                {formatTime(matchDate)}
              </div>
            </div>
          )}

          {competition && (
            <div
              className="flex flex-col border-b px-6 py-5"
              style={{ borderColor: 'var(--fw-border)' }}
            >
              <div
                className="mb-1 text-xs font-bold uppercase tracking-widest"
                style={{
                  color: 'var(--fw-text-muted)',
                  letterSpacing: '0.1em',
                }}
              >
                Competition
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: 'var(--fw-text-primary)' }}
              >
                {competition}
              </div>
            </div>
          )}

          {roundStage && (
            <div
              className="flex flex-col px-6 py-5"
              style={{ borderColor: 'var(--fw-border)' }}
            >
              <div
                className="mb-1 text-xs font-bold uppercase tracking-widest"
                style={{
                  color: 'var(--fw-text-muted)',
                  letterSpacing: '0.1em',
                }}
              >
                Round
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: 'var(--fw-text-primary)' }}
              >
                {roundStage}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
