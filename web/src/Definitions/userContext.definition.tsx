export type UserProps = {
  id: string;
  userRole: string;
  companyName: string;
  userState: number;
  userSectors: string[];
  validatePermission: string;
  subRolePermission: string;
  ghgInventoryPermission: string;
};

export interface UserContextProps {
  userInfoState?: UserProps;
  isGhgAllowed?: boolean;
  isValidationAllowed?: boolean;
  setUserInfo: (val: UserProps) => void;
  removeUserInfo: () => void;
  IsAuthenticated: (tkn?: any) => boolean;
  isTokenExpired: boolean;
  setIsTokenExpired: (val: boolean) => void;
  setIsGhgAllowed: (val: boolean) => void;
  setIsValidationAllowed: (val: boolean) => void;
}
