import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { allowedValueActions, listsForPillar } from '../../../../shared/platform/masterData.js';
import { getMasterData } from '../../../../shared/platform/platformData.js';
import { coveredPlantIds } from '../../../../shared/platform/permissions.js';
import Icon from '../shell/Icon.jsx';
import NotAllowed from '../shell/NotAllowed.jsx';
import ValueForm from './ValueForm.jsx';
import ValueList from './ValueList.jsx';

// Master data tab (FR-013 to FR-021): the lists of the pillar, the values of the chosen list and
// whether each is available at one of the user's plants.
export default function MasterDataTab() {
  const { pillar, role } = useOutletContext();
  const { user, organization } = useApp();
  const lists = listsForPillar(pillar.id);
  const listId = useParams()['*'] || lists[0]?.id;
  const list = lists.find((item) => item.id === listId);
  const plants = coveredPlantIds(role, organization).map((id) => organization.find((node) => node.id === id));
  const [plantId, setPlantId] = useState(plants[0].id);
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null); // { value } while adding (value null) or editing
  const [saved, setSaved] = useState('');
  const closeForm = useCallback(() => setForm(null), []);

  const reload = useCallback(() => getMasterData().then(setData), []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (lists.length === 0 || list) {
      document.title = `${list ? list.label : 'Master data'} — ${pillar.label} — Control Panel`;
    }
  }, [lists.length, list, pillar.label]);

  if (lists.length === 0) {
    return (
      <main className="page">
        <h1>Master data</h1>
        <p className="message message--warning">Master data for {pillar.label} comes later.</p>
      </main>
    );
  }
  if (!list) {
    return <NotAllowed reason="notFound" />;
  }

  async function handleChanged(message) {
    setForm(null);
    await reload();
    setSaved(message);
  }

  const canAdd = allowedValueActions(user, list, null).add;

  return (
    <main className="page">
      <h1>Master data</h1>
      <nav className="list-chips" aria-label="Lists">
        {lists.map((item) => (
          <Link
            key={item.id}
            to={`/pillars/${pillar.id}/master-data/${item.id}`}
            className="chip"
            aria-current={item.id === listId ? 'page' : undefined}
            onClick={() => setSaved('')}
          >
            {item.readOnly && <Icon name="lock" size={14} />}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="list-head">
        <div>
          <h2>{list.label}</h2>
          <p className="field-hint">
            {list.readOnly && 'Owned by Health & Safety — read-only here.'}
            {!list.readOnly && list.fixedGlobal && 'Fixed global list, maintained by Central only.'}
            {!list.readOnly && !list.fixedGlobal && 'Central maintains global values; Clusters add their own; everyone can switch values off for their plants.'}
          </p>
        </div>
      </div>

      {saved && (
        <p className="message message--success" role="status">
          {saved}
        </p>
      )}
      {!data && <p>Loading…</p>}
      {data && (
        <ValueList
          list={list}
          values={data.values}
          activations={data.activations}
          plants={plants}
          plantId={plantId}
          onPlantChange={setPlantId}
          canImport={canAdd}
          onCreate={canAdd ? () => setForm({ value: null }) : null}
          onEdit={(value) => setForm({ value })}
          onChanged={handleChanged}
        />
      )}
      {form && data && (
        <ValueForm list={list} value={form.value} values={data.values} onSaved={handleChanged} onClose={closeForm} />
      )}
    </main>
  );
}
