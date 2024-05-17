export type UserProps = {
  id: string;
  userRole: string;
  companyName: string;
  companyState: number;
  userSectors: string[];
};

export interface UserContextProps {
  userInfoState?: UserProps;
  setUserInfo: (val: UserProps) => void;
  removeUserInfo: () => void;
  IsAuthenticated: (tkn?: any) => boolean;
  isTokenExpired: boolean;
  setIsTokenExpired: (val: boolean) => void;
}
