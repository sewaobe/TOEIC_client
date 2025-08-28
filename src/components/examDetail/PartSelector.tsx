import { Checkbox, FormControlLabel } from '@mui/material';
import { Part } from '../../types/examDetail';

interface PartSelectorProps {
  parts: Part[];
  selectedParts: string[];
  togglePart: (label: string) => void;
}

const PartSelector: React.FC<PartSelectorProps> = ({
  parts,
  selectedParts,
  togglePart,
}) => {
  return (
    <div className='space-y-4'>
      {parts.map((part, idx) => (
        <div
          key={idx}
          className='p-4 border rounded-lg shadow-sm hover:shadow-md transition'
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedParts.includes(part.label)}
                onChange={() => togglePart(part.label)}
              />
            }
            label={<span className='font-medium'>{part.label}</span>}
          />
          <div className='flex flex-wrap gap-2 mt-2'>
            {part.tags.map((t, i) => (
              <span
                key={i}
                className={`px-2 py-1 rounded-full text-sm cursor-pointer transition-transform ${t.color}`}
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartSelector;
