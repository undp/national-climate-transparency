import {
  BankOutlined,
  ExperimentOutlined,
  EyeOutlined,
  KeyOutlined,
  SearchOutlined,
  StarOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import React, { FC } from 'react';
import {
  AdminBGColor,
  AdminColor,
  GovBGColor,
  GovColor,
  ObsBGColor,
  ObsColor,
  RootBGColor,
  RootColor,
} from '../../Styles/role.color.constants';
import { RoleIcon } from '../common/RoleIcon/role.icon';

export interface UserRoleIconProps {
  role: string;
}

export const UserRoleIcon: FC<UserRoleIconProps> = (props: UserRoleIconProps) => {
  const { role } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
      {role === 'Admin' ? (
        <RoleIcon icon={<StarOutlined />} bg={AdminBGColor} color={AdminColor} />
      ) : role === 'GovernmentUser' ? (
        <RoleIcon icon={<BankOutlined />} bg={GovBGColor} color={GovColor} />
      ) : role === 'Observer' ? (
        <RoleIcon icon={<ExperimentOutlined />} bg={ObsBGColor} color={ObsColor} />
      ) : (
        <RoleIcon icon={<KeyOutlined />} bg={RootBGColor} color={RootColor} />
      )}
      <div>
        {role === 'Admin'
          ? 'Administrator'
          : role === 'Root'
          ? 'Super Admin'
          : role === 'GovernmentUser'
          ? 'Government User'
          : role === 'Observer'
          ? 'Observer'
          : role}
      </div>
    </div>
  );
};
