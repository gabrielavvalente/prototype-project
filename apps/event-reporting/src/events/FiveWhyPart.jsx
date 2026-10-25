import { Badge, Button, Switch, Textarea } from '@mantine/core';
import { addWhyBelow, branchWhy, causeName, childrenOf, MAX_WHYS, whyDepth } from '../logic/rootCause.js';
import Icon from '../shell/Icon.jsx';

// One why: the answer, whether it is a root cause (the card is highlighted), its actions and what
// can be done from it. Actions need an answer first.
function WhyCard({ why, depth, actionCount, canRemove, readOnly, onChange, onAddBelow, onBranch, onAddAction, onRemove }) {
  const isRoot = Boolean(why.rootCause);
  const answered = Boolean(why.answer.trim());
  return (
    <div className={`rca-card why-card${isRoot ? ' why-card--root' : ''}`}>
      <div className="why-card-head">
        <strong>Why {depth}</strong>
        {actionCount > 0 && (
          <Badge variant="light" size="sm">
            {actionCount} action{actionCount > 1 ? 's' : ''}
          </Badge>
        )}
        {!readOnly && canRemove && (
          <button type="button" className="icon-button why-card-remove" onClick={onRemove}>
            <Icon name="close" size={16} label={`Delete why ${depth}`} />
          </button>
        )}
      </div>
      <Textarea aria-label={`Why ${depth}`} minRows={2} autosize value={why.answer} onChange={(e) => onChange({ answer: e.target.value })} />
      <Switch label="Root cause" checked={isRoot} onChange={(e) => onChange({ rootCause: e.currentTarget.checked })} />
      {!readOnly && (
        <div className="why-card-actions">
          {onAddBelow && (
            <Button type="button" variant="default" size="compact-xs" leftSection={<Icon name="plus" size={12} />} onClick={onAddBelow}>
              Add why
            </Button>
          )}
          <Button type="button" variant="default" size="compact-xs" onClick={onBranch} aria-label={`Branch why ${depth}: add an alternative answer`}>
            Branch
          </Button>
          <Button
            type="button"
            variant="default"
            size="compact-xs"
            disabled={!answered}
            title={answered ? undefined : 'Write the answer first'}
            onClick={onAddAction}
          >
            Add action
          </Button>
        </div>
      )}
    </div>
  );
}

// 5 Why as a tree under the 6M causes (004 FR-010, FR-011): each cause heads a column with the
// explanation given in 6M; a why and its only next why stack; several next whys sit side by side.
// Branch on any why adds an alternative answer beside it.
export default function FiveWhyPart({ causes, whys, onChange, actions, readOnly, onAddAction, onRemoveWhy }) {
  const setWhy = (id, changes) => onChange(whys.map((why) => (why.id === id ? { ...why, ...changes } : why)));

  // A plain function, not a component, so the cards keep their focus while typing.
  function renderBranches(parentId) {
    const children = childrenOf(whys, parentId);
    if (children.length === 0) return null;
    return (
      <div className={`why-branches${children.length > 1 ? ' why-branches--split' : ''}`}>
        {children.map((why) => {
          const depth = whyDepth(whys, why);
          const hasNext = childrenOf(whys, why.id).length > 0;
          const isFirst = !whys.some((item) => item.id === why.parentId);
          return (
            <div key={why.id} className="why-path">
              <WhyCard
                why={why}
                depth={depth}
                actionCount={actions.filter((action) => action.whyId === why.id).length}
                canRemove={!(isFirst && children.length === 1)}
                readOnly={readOnly}
                onChange={(changes) => setWhy(why.id, changes)}
                onAddBelow={!hasNext && depth < MAX_WHYS ? () => onChange(addWhyBelow(whys, why.id)) : null}
                onBranch={() => onChange(branchWhy(whys, why.id))}
                onAddAction={() => onAddAction(why.id)}
                onRemove={() => onRemoveWhy(why.id)}
              />
              {renderBranches(why.id)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="five-why">
      <div className={`why-branches${causes.length > 1 ? ' why-branches--split' : ''}`}>
        {causes.map((cause, index) => (
          <div key={cause.id} className="why-path">
            <div className="rca-card why-card why-card--cause">
              <Textarea label={`C${index + 1} · ${causeName(cause)}`} value={cause.why} autosize minRows={1} disabled readOnly />
            </div>
            {renderBranches(cause.id)}
          </div>
        ))}
      </div>
    </div>
  );
}
