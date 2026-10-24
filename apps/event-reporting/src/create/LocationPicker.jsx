import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../AppContext.js';
import { buildLocationPaths, getAncestry, LEVEL_TYPES, locationFromNode, resolveQrCode, searchLocations } from '../logic/locations.js';
import { findById, getChildren } from '../logic/lookups.js';
import Icon from '../shell/Icon.jsx';
import Sheet from '../shell/Sheet.jsx';

const MAX_RESULTS = 30;

// Can this browser read QR codes from the camera? (BarcodeDetector: Chrome on Android, among others.)
function canScanQrCodes() {
  return 'BarcodeDetector' in window && Boolean(navigator.mediaDevices?.getUserMedia);
}

// Shows the back camera and reports the first QR code it reads.
function QrScanner({ onCode }) {
  const videoRef = useRef(null);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    let stream = null;
    let timer = null;
    let stopped = false;
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((cameraStream) => {
        if (stopped) {
          cameraStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = cameraStream;
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play();
        timer = setInterval(async () => {
          const codes = await detector.detect(videoRef.current).catch(() => []);
          if (codes.length > 0 && !stopped) {
            onCode(codes[0].rawValue);
          }
        }, 400);
      })
      .catch(() => setProblem('The camera could not be opened. Allow camera access, or search or browse instead.'));

    return () => {
      stopped = true;
      clearInterval(timer);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [onCode]);

  if (problem) {
    return <p className="message message--warning">{problem}</p>;
  }
  return (
    <div className="qr-scanner">
      <video ref={videoRef} muted playsInline aria-label="Camera view for scanning a QR code" />
      <p className="field-hint">Point the camera at the QR code on the station.</p>
    </div>
  );
}

function capitalize(text) {
  return text[0].toUpperCase() + text.slice(1);
}

// Choose a location by typing, browsing one level at a time, or scanning a station QR code (FR-005).
// minType: the shallowest level that can be chosen ('task', or 'workshop' for TF4 / TF5).
export default function LocationPicker({ plantId, minType = 'task', onSelect, onClose }) {
  const { organization } = useApp();
  const [query, setQuery] = useState('');
  const [browseNodeId, setBrowseNodeId] = useState(plantId);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const paths = useMemo(() => buildLocationPaths(organization, plantId, minType), [organization, plantId, minType]);
  const results = searchLocations(paths, query).slice(0, MAX_RESULTS);
  const browseTrail = getAncestry(organization, browseNodeId);
  const children = getChildren(organization, browseNodeId);
  const plant = findById(organization, plantId);
  const browseNode = findById(organization, browseNodeId);
  // While browsing, the current level can be used when it is deep enough (e.g. a workshop for TF4).
  const canUseBrowseNode =
    browseNode.type !== 'plant' && LEVEL_TYPES.indexOf(browseNode.type) >= LEVEL_TYPES.indexOf(minType);
  // The latest callbacks, kept in refs so the camera does not restart when the form re-renders.
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  onSelectRef.current = onSelect;
  onCloseRef.current = onClose;

  function choose(location) {
    onSelect(location);
    onClose();
  }

  function openNode(node) {
    if (node.type === 'task') {
      choose(locationFromNode(organization, node.id));
    } else {
      setBrowseNodeId(node.id);
    }
  }

  const handleCode = useCallback(
    (code) => {
      setScanning(false);
      const result = resolveQrCode(organization, plantId, code, minType);
      if (result.location) {
        onSelectRef.current(result.location);
        onCloseRef.current();
      } else if (result.browseFrom) {
        setQuery('');
        setBrowseNodeId(result.browseFrom);
        setScanMessage('QR code read. Choose a deeper level below.');
      } else {
        setScanMessage(result.error);
      }
    },
    [organization, plantId, minType],
  );

  function startScan() {
    if (!canScanQrCodes()) {
      setScanMessage('QR code scanning is not available in this browser. Search or browse the location instead.');
      return;
    }
    setScanMessage('');
    setScanning(true);
  }

  return (
    <Sheet title="Location" onClose={onClose}>
      <div className="location-search">
        <label className="search-field search-field--small">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Search a location</span>
          <input
            type="search"
            placeholder="Type a department, workshop, station…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button type="button" className="button" onClick={scanning ? () => setScanning(false) : startScan}>
          <Icon name="qr" size={18} /> {scanning ? 'Stop scan' : 'Scan QR code'}
        </button>
      </div>

      {scanMessage && (
        <p className="message message--warning" role="status">
          {scanMessage}
        </p>
      )}
      {scanning && <QrScanner onCode={handleCode} />}

      {!scanning && query.trim() && (
        <section aria-labelledby="location-results">
          <h3 id="location-results" className="section-label" role="status">
            {results.length === 0 ? 'No location matches — try browsing below' : `${results.length} locations`}
          </h3>
          <ul className="plain-list">
            {results.map((path) => (
              <li key={path.nodeId}>
                <button type="button" className="list-row" onClick={() => choose(path.location)}>
                  <Icon name="location" size={18} />
                  <span className="list-row-text">
                    <strong>{path.names[path.names.length - 1]}</strong>
                    <small>{path.names.slice(0, -1).join(' › ')}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!scanning && (!query.trim() || results.length === 0) && (
        <section aria-labelledby="location-browse">
          <h3 id="location-browse" className="section-label">
            Browse
          </h3>
          <nav className="breadcrumb" aria-label="Location levels">
            <button type="button" className="button button--link" onClick={() => setBrowseNodeId(plantId)}>
              {plant.name}
            </button>
            {browseTrail.map((node) => (
              <span key={node.id}>
                {' › '}
                <button type="button" className="button button--link" onClick={() => setBrowseNodeId(node.id)}>
                  {node.name}
                </button>
              </span>
            ))}
          </nav>
          {canUseBrowseNode && (
            <button
              type="button"
              className="button button--secondary button--block use-level"
              onClick={() => choose(locationFromNode(organization, browseNode.id))}
            >
              <Icon name="check" size={18} /> Use this {browseNode.type}: {browseNode.name}
            </button>
          )}
          <ul className="plain-list">
            {children.map((node) => (
              <li key={node.id}>
                <button type="button" className="list-row" onClick={() => openNode(node)}>
                  <span className="list-row-text">
                    <strong>{node.name}</strong>
                    <small>{node.type === 'task' ? 'Task — select' : capitalize(node.type)}</small>
                  </span>
                  <Icon name={node.type === 'task' ? 'check' : 'chevronRight'} size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Sheet>
  );
}
