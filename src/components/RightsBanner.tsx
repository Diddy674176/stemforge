interface Props {
  onAccept: () => void;
}

export function RightsBanner({ onAccept }: Props) {
  return (
    <div className="rights-banner" role="dialog" aria-modal="true">
      <div className="rights-card">
        <h1>StemForge</h1>
        <p>
          Only import audio you own or have permission to remix. Everything stays in your
          browser — no uploads, no DRM bypass, no voice cloning.
        </p>
        <p className="muted">
          Exporting a mix does not grant rights you did not already have.
        </p>
        <button type="button" className="btn primary btn-lg" onClick={onAccept}>
          Accept
        </button>
      </div>
    </div>
  );
}
