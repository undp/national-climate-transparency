import { BankOutlined, ExperimentOutlined } from '@ant-design/icons';
import { DevBGColor, DevColor, GovBGColor, GovColor, RoleIcon } from '@undp/carbon-library';
import { FC } from 'react';

export interface CompanyRoleIconProps {
  role: string;
}

const CompanyRoleIcon: FC<CompanyRoleIconProps> = (props: CompanyRoleIconProps) => {
  const { role } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {role === 'Government' ? (
        <RoleIcon icon={<BankOutlined />} bg={GovBGColor} color={GovColor} />
      ) : (
        <RoleIcon icon={<ExperimentOutlined />} bg={DevBGColor} color={DevColor} />
      )}
      <div>{role}</div>
    </div>
  );
};

export default CompanyRoleIcon;
