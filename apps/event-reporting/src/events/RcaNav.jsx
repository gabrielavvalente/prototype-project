import Icon from '../shell/Icon.jsx';

// The list on the left of 5W1H and 6M (ui-ux designs): one button per section or theme, the
// current one highlighted, with an optional note (e.g. "2 ticked", "Done").
export default function RcaNav({ title, items, current, onSelect, children }) {
  return (
    <nav className="rca-nav" aria-label={title}>
      <p className="rca-nav-title">{title}</p>
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className="rca-nav-item"
              aria-current={item.key === current ? 'true' : undefined}
              onClick={() => onSelect(item.key)}
            >
              <Icon name="list" size={16} />
              <span>{item.label}</span>
              {item.note && <span className="rca-nav-note">{item.note}</span>}
            </button>
          </li>
        ))}
      </ul>
      {children}
    </nav>
  );
}
