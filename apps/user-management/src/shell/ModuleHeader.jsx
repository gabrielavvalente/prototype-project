export default function ModuleHeader({ moduleName, moduleHref, search, children }) {
  return (
    <header className="module-header">
      <div className="module-header-brand">
        <a className="module-header-home" href="/" aria-label="Home" title="All applications">
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
          </svg>
        </a>
        <span className="module-header-divider" aria-hidden="true" />
        <a className="module-header-name" href={moduleHref}>
          {moduleName}
        </a>
      </div>
      <div className="module-header-search">{search}</div>
      <div className="module-header-actions">{children}</div>
    </header>
  );
}
