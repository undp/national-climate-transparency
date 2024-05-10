import React, { useContext, useState, createContext, useCallback } from 'react';
import { useConnection } from '../ConnectionContext/connectionContext';
import jwt_decode from 'jwt-decode';
import { UserContextProps, UserProps } from '../../Definitions/userContext.definition';

export const UserContext = createContext<UserContextProps>({
  setUserInfo: () => {},
  removeUserInfo: () => {},
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  IsAuthenticated: (tkn?: any) => false,
  isTokenExpired: false,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  setIsTokenExpired: (val: boolean) => {},
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
    companyState: localStorage.getItem('companyState')
      ? parseInt(localStorage.getItem('companyState') as string)
      : process.env.STORYBOOK_COMPANY_STATE
      ? parseInt(process.env.STORYBOOK_COMPANY_STATE)
      : 0,
    userSectors: localStorage.getItem('userSectors') ?? '',
  };
  const [userInfoState, setUserInfoState] = useState<UserProps>(initialUserProps);

  const setUserInfo = (value: UserProps) => {
    const state = userInfoState?.companyState === 1 ? userInfoState?.companyState : 0;
    const { id, userRole, companyName, companyState = state, userSectors } = value;
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

    setUserInfoState((prev) => ({ ...prev, companyState }));
    localStorage.setItem('companyState', companyState + '');

    setUserInfoState((prev) => ({ ...prev, userSectors }));
    localStorage.setItem('userSectors', userSectors + '');
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
            setIsTokenExpired(true);
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
    localStorage.removeItem('companyState');
    localStorage.removeItem('userSectors');
    setUserInfoState(initialUserProps);
  };

  return (
    <UserContext.Provider
      value={{
        userInfoState,
        setUserInfo,
        removeUserInfo,
        IsAuthenticated,
        isTokenExpired,
        setIsTokenExpired,
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
