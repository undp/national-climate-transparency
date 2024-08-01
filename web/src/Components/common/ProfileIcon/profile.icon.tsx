import { FC } from 'react';
import './profile.icon.scss';
import { isBase64 } from '../../../Utils/utilServices';

export interface ProfileIconProps {
  icon: any;
  bg: string;
  name: string;
}

export const ProfileIcon: FC<ProfileIconProps> = (props: ProfileIconProps) => {
  const { icon, bg, name } = props;

  return (
    <span className="profile-icon" style={{ backgroundColor: bg }}>
      {isBase64(icon) ? (
        <img alt="profile-icon" src={'data:image/jpeg;base64,' + icon} />
      ) : icon ? (
        <img alt="profile-icon" src={icon} />
      ) : name ? (
        name.charAt(0).toUpperCase()
      ) : (
        'A'
      )}
    </span>
  );
};
