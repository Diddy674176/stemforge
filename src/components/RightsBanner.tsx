interface Props {
  onAccept: () => void;
}

export function RightsBanner({ onAccept }: Props) {
  return (
    <div className="rights-banner" role="dialog" aria-modal="true">
      <div className="rights-card">
        <h1>StemForge — Rights notice</h1>
        <p>
          Only import audio <strong>you own</strong> or have explicit permission to remix.
          StemForge never downloads music, bypasses DRM, scrapes catalogs, or clones artist voices.
        </p>
        <p>
          Processing stays in your browser (IndexedDB). Exporting a remix does not grant you
          rights you did not already have.
        </p>
        <ul>
          <li>No unauthorized commercial use of others&apos; recordings</li>
          <li>No DRM circumvention</li>
          <li>Privacy-local: audio does not leave this device</li>
        </ul>
        <button type="button" className="btn primary" onClick={onAccept}>
          I have rights — Continue
        </button>
      </div>
    </div>
  );
}
