import React from 'react';

type StylePreset = 'Executive' | 'Workshop' | 'Investor';

interface CommandBarProps {
  stylePreset: StylePreset;
  onStyleChange: (preset: StylePreset) => void;
  tweakRequest: string;
  onTweakChange: (value: string) => void;
  onImprove: () => void;
  originalImage: File | null;
  isLoading: boolean;
}

const styleMap: { label: string; value: StylePreset }[] = [
  { label: 'Quick Fix', value: 'Executive' },
  { label: 'Make It Pop', value: 'Workshop' },
  { label: 'Pitch Ready', value: 'Investor' },
];

const CommandBar: React.FC<CommandBarProps> = ({
  stylePreset, onStyleChange, tweakRequest, onTweakChange, onImprove,
  originalImage, isLoading
}) => {
  const isActionDisabled = !originalImage || isLoading;

  return (
    <footer className="card command-bar" aria-label="Actions">
      <div className="control-group">
        <label className="control-label">Style</label>
        <div className="segmented-control" role="radiogroup">
            {styleMap.map(({ label, value }) => (
              <button
                key={value}
                role="radio"
                aria-checked={stylePreset === value}
                aria-pressed={stylePreset === value}
                onClick={() => onStyleChange(value)}
                disabled={isActionDisabled}
              >
                {label}
              </button>
            ))}
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="instruction-input" className="control-label">Instructions</label>
        <input
          id="instruction-input"
          type="text"
          className="text-input"
          placeholder="Specify directions for improvement"
          value={tweakRequest}
          onChange={(e) => onTweakChange(e.target.value)}
          disabled={isActionDisabled}
        />
      </div>

      <div className="action-buttons">
         <button className="primary-button" onClick={onImprove} disabled={isActionDisabled}>
            {isLoading ? 'Working...' : 'Improve Slide'}
            {isLoading && <div className="button-spinner" />}
          </button>
      </div>
    </footer>
  );
};

export default CommandBar;
