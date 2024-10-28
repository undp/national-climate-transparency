import './numberChip.scss';
import { Tag, Tooltip } from 'antd';
import { EmissionUnits } from '../../Enums/emission.enum';
import { convertToMillions } from '../../Utils/utilServices';

interface Props {
  value: number;
  valueType?: EmissionUnits;
}

const NumberChip: React.FC<Props> = ({ value, valueType }) => {
  // Converting to Million or Billion format to prevent overflow
  const { processedNumber, isConverted } = convertToMillions(value);

  return (
    <div className="number-chip">
      <Tooltip title={isConverted ? value : undefined} showArrow={false} placement="top">
        {valueType ? (
          <Tag className={`${valueType}_color`}>{processedNumber}</Tag>
        ) : (
          <Tag className="default_color">{processedNumber}</Tag>
        )}
      </Tooltip>
    </div>
  );
};

export default NumberChip;
