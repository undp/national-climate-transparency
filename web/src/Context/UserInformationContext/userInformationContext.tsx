import React, { useContext, useState, createContext, useCallback } from 'react';
import { useConnection } from '../ConnectionContext/connectionContext';
import jwt_decode from 'jwt-decode';
import { UserContextProps, UserProps } from '../../Definitions/userContext.definition';
import { GHGInventoryManipulate, ValidateEntity } from '../../Enums/user.enum';

export const UserContext = createContext<UserContextProps>({
  setUserInfo: () => {},
  removeUserInfo: () => {},
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  IsAuthenticated: (tkn?: any) => false,
  isTokenExpired: false,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  setIsTokenExpired: (val: boolean) => {},
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  setIsGhgAllowed: (val: boolean) => {},
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  setIsValidationAllowed: (val: boolean) => {},
});

export const UserInformationContextProvider = ({ children }: React.PropsWithChildren) => {
  const { token } = useConnection();

  const [isTokenExpired, setIsTokenExpired] = useState<boolean>(false);

  const initialUserProps: UserProps = {
    id: localStorage.getItem('userId')
      ? (localStorage.getItem('userId') as string)
      : process.env.STORYBOOK_USER_ID
      ? process.env.STORYBOOK_USER_ID
      : '',
    userRole: localStorage.getItem('userRole')
      ? (localStorage.getItem('userRole') as string)
      : process.env.STORYBOOK_USER_ROLE
      ? process.env.STORYBOOK_USER_ROLE
      : '',
    companyName: localStorage.getItem('companyName')
      ? (localStorage.getItem('companyName') as string)
      : process.env.STORYBOOK_COMPANY_NAME
      ? process.env.STORYBOOK_COMPANY_NAME
      : '',
    userState: localStorage.getItem('userState')
      ? parseInt(localStorage.getItem('userState') as string)
      : 0,
    userSectors: localStorage.getItem('userSectors')?.split(',') ?? [],
    validatePermission: localStorage.getItem('validatePermission')
      ? (localStorage.getItem('validatePermission') as string)
      : '0',
    subRolePermission: localStorage.getItem('subRolePermission')
      ? (localStorage.getItem('subRolePermission') as string)
      : '0',
    ghgInventoryPermission: localStorage.getItem('ghgInventoryPermission')
      ? (localStorage.getItem('ghgInventoryPermission') as string)
      : '0',
  };

  const [userInfoState, setUserInfoState] = useState<UserProps>(initialUserProps);
  const [isGhgAllowed, setIsGhgAllowed] = useState<boolean>(
    initialUserProps.validatePermission === ValidateEntity.CAN
  );
  const [isValidationAllowed, setIsValidationAllowed] = useState<boolean>(
    initialUserProps.ghgInventoryPermission === GHGInventoryManipulate.CAN
  );

  const setUserInfo = (value: UserProps) => {
    const state = userInfoState?.userState === 1 ? userInfoState?.userState : 0;
    const {
      id,
      userRole,
      companyName,
      userState = state,
      userSectors,
      validatePermission,
      subRolePermission,
      ghgInventoryPermission,
    } = value;
    if (id) {
      setUserInfoState((prev) => ({ ...prev, id }));
      localStorage.setItem('userId', id);
    }

    if (userRole) {
      setUserInfoState((prev) => ({ ...prev, userRole }));
      localStorage.setItem('userRole', userRole);
    }

    if (companyName) {
      setUserInfoState((prev) => ({ ...prev, companyName }));
      localStorage.setItem('companyName', companyName);
    }

    setUserInfoState((prev) => ({ ...prev, userState }));
    localStorage.setItem('userState', userState + '');

    setUserInfoState((prev) => ({ ...prev, userSectors }));
    localStorage.setItem('userSectors', userSectors + '');

    setUserInfoState((prev) => ({ ...prev, validatePermission }));
    setIsValidationAllowed(validatePermission === ValidateEntity.CAN);
    localStorage.setItem('validatePermission', validatePermission + '');

    setUserInfoState((prev) => ({ ...prev, subRolePermission }));
    localStorage.setItem('subRolePermission', subRolePermission + '');

    setUserInfoState((prev) => ({ ...prev, ghgInventoryPermission }));
    setIsGhgAllowed(ghgInventoryPermission === GHGInventoryManipulate.CAN);
    localStorage.setItem('ghgInventoryPermission', ghgInventoryPermission + '');
  };

  const IsAuthenticated = useCallback(
    (tokenNew?: any): boolean => {
      let tokenVal: string | null;
      if (tokenNew) {
        tokenVal = tokenNew;
      } else if (token) {
        tokenVal = token;
      } else {
        tokenVal = localStorage.getItem('token');
        if (tokenVal === '') {
          if (history.length !== 1) {
            setTimeout(() => {
              setIsTokenExpired(true);
            }, 0);
          }
        }
      }
      try {
        if (tokenVal) {
          const { exp } = jwt_decode(tokenVal) as any;
          return Date.now() < exp * 1000;
        }
        return false;
      } catch (err) {
        return false;
      }
    },
    [token]
  );

  const removeUserInfo = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('companyName');
    localStorage.removeItem('userState');
    localStorage.removeItem('userSectors');
    localStorage.removeItem('validatePermission');
    localStorage.removeItem('subRolePermission');
    localStorage.removeItem('ghgInventoryPermission');
    localStorage.removeItem('token');
    setUserInfoState(initialUserProps);
    setIsGhgAllowed(false);
    setIsValidationAllowed(false);
  };

  return (
    <UserContext.Provider
      value={{
        userInfoState,
        isGhgAllowed,
        isValidationAllowed,
        setUserInfo,
        removeUserInfo,
        IsAuthenticated,
        isTokenExpired,
        setIsTokenExpired,
        setIsGhgAllowed,
        setIsValidationAllowed,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

export const useUserContext = (): UserContextProps => {
  return useContext(UserContext);
};
