import { useState } from 'react';

// A round top for the axis: 4 gridlines at whole numbers.
function axisMax(largest) {
  return Math.max(4, Math.ceil(largest / 4) * 4);
}

// Stacked columns with a total on top, details on hover or focus, an optional legend and a table
// view. columns: [{ key, label (node), caption, total, segments: [{ key, label, count, color }] }];
// table: { headers: [text], rows: [[cells]] }.
export default function StackedColumnChart({ title, subtitle, columns, legend, table }) {
  const [hovered, setHovered] = useState(null); // "columnKey/segmentKey"
  const top = axisMax(Math.max(0, ...columns.map((column) => column.total)));
  const ticks = [4, 3, 2, 1, 0].map((step) => (top / 4) * step);

  return (
    <figure className="chart-card">
      <figcaption>
        <h2 className="chart-title">{title}</h2>
        <p className="chart-subtitle">{subtitle}</p>
      </figcaption>
      {legend}

      <div className="bar-chart">
        <div className="bar-chart-grid" aria-hidden="true">
          {ticks.map((tick) => (
            <div key={tick} className="bar-chart-gridline">
              <span>{tick}</span>
            </div>
          ))}
        </div>
        <div className="bar-chart-columns">
          {columns.map((column) => (
            <div key={column.key} className="bar-chart-column">
              <div className="bar-chart-track">
                <div className="bar-chart-stack" style={{ height: `${(column.total / top) * 100}%` }}>
                  <span className="bar-chart-total">{column.total}</span>
                  {column.segments.map((segment) => {
                    if (segment.count === 0) return null;
                    const id = `${column.key}/${segment.key}`;
                    return (
                      <div
                        key={segment.key}
                        className="bar-chart-segment"
                        tabIndex={0}
                        aria-label={`${column.caption}, ${segment.label}: ${segment.count}`}
                        style={{ flexGrow: segment.count, background: segment.color }}
                        onMouseEnter={() => setHovered(id)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(id)}
                        onBlur={() => setHovered(null)}
                      >
                        {hovered === id && (
                          <span className="bar-chart-tooltip" role="tooltip">
                            <strong>{segment.count}</strong> {segment.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {column.label}
            </div>
          ))}
        </div>
      </div>

      <details className="chart-table">
        <summary>Show as table</summary>
        <table className="kpi-table">
          <thead>
            <tr>
              {table.headers.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((cells) => (
              <tr key={cells.slice(0, -1).join('/')}>
                {cells.map((cell, index) => (
                  <td key={index}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
