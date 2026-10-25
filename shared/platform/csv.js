// CSV files for exporting and importing master data (review 2026-10-25). Comma separated, with
// quotes around values that hold a comma, a quote or a line break, as Excel writes them.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

function quote(text) {
  const value = String(text ?? '');
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

// rows: arrays of cells, the first one being the header.
export function toCsv(rows) {
  return rows.map((row) => row.map(quote).join(',')).join('\r\n');
}

// Splits the text into rows of cells, reading quoted cells character by character.
function readCells(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',' || char === '\n') {
      row.push(cell);
      cell = '';
      if (char === '\n') {
        rows.push(row);
        row = [];
      }
    } else if (char !== '\r') {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((cells) => cells.some((item) => item.trim() !== ''));
}

// Returns one object per line, keyed by the header names in lower case ("Code" → "code").
export function parseCsv(text) {
  const [header = [], ...lines] = readCells(text.replace(/^﻿/, ''));
  const keys = header.map((name) => name.trim().toLowerCase());
  return lines.map((cells) => Object.fromEntries(keys.map((key, index) => [key, (cells[index] ?? '').trim()])));
}
