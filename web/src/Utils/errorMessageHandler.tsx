import { message } from 'antd';

export const displayErrorMessage = (error: any, customError?: string | null) => {
  if (error.message !== 'user deactivated' || error.message !== 'jwt expired') {
    message.open({
      type: 'error',
      content: customError ?? error.message,
      duration: 3,
      style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
    });
  }
};
