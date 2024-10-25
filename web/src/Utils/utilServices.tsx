import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { Buffer } from 'buffer';
import { AcceptedFileExtensions } from '../Enums/file.enum';
import { ActionType } from '../Enums/action.enum';

export const addCommSep = (value: any) => {
  return (
    Number(value)
      // .toString()
      .toFixed(2)
      .replace('.00', '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );
};

export const addCommSepRound = (value: any) => {
  return Number(value)
    .toFixed(2)
    .replace('.00', '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const isBase64 = (str: string) => {
  if (!str || str === '' || str.trim() === '') {
    return false;
  }
  try {
    const bs = Buffer.from(str, 'base64').toString('base64');
    return bs === str;
  } catch (err) {
    return false;
  }
};

export const addSpaces = (text: string) => {
  if (!text) {
    return text;
  }
  if (text === text.toUpperCase()) {
    return text;
  }
  return text.replace(/([A-Z])/g, ' $1').trim();
};

export const joinTwoArrays = (arrayOne: any[], arrayTwo: any[]) => {
  const joinedArray = [...arrayOne];
  arrayTwo.forEach((value) => {
    if (!joinedArray.includes(value)) {
      joinedArray.push(value);
    }
  });
  return joinedArray;
};

export const getFormTitle = (
  formType: 'Action' | 'Programme' | 'Project' | 'Activity' | 'Support',
  formMethod: 'create' | 'update' | 'view'
) => {
  if (formMethod === 'create') {
    return `add${formType}Title`;
  } else if (formMethod === 'update') {
    return `edit${formType}Title`;
  } else {
    return `view${formType}Title`;
  }
};

export const CustomFormatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  const formattedTime = `${day} ${month} ${year} @ ${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} ${period}`;

  return formattedTime;
};

export const DashboardTotalFormatter = (value: number, isCurrency: boolean) => {
  return isCurrency ? `$ ${Math.round(value)}` : value.toString();
};

export const getArraySum = (values: number[]) => {
  return values.reduce((acc, value) => acc + value, 0);
};

export const customRound = (value: number) => {
  return Math.round(value * 100) / 100;
};

export const getRounded = (num: number | string): number => {
  if (typeof num === 'string') {
    return customRound(parseFloat(num));
  } else if (typeof num === 'number') {
    if (Number.isInteger(num)) {
      return num;
    } else {
      return customRound(num);
    }
  } else {
    return 0;
  }
};

export const convertToMillions = (value: number) => {
  const roundedNumber = getRounded(value);
  let numberInMills = roundedNumber.toString();
  if (roundedNumber > 1000000000) {
    numberInMills = `${customRound(roundedNumber / 1000000000)} billion`;
  } else if (roundedNumber > 1000000) {
    numberInMills = `${customRound(roundedNumber / 1000000)} million`;
  }

  return numberInMills;
};

export const getCollapseIcon = (isActive: boolean, clicked?: any) => {
  return isActive ? (
    <MinusCircleOutlined
      onClick={clicked ? clicked : undefined}
      style={{ color: '#9155fd', fontSize: '14px' }}
    />
  ) : (
    <PlusCircleOutlined
      onClick={clicked ? clicked : undefined}
      style={{ color: '#9155fd', fontSize: '14px' }}
    />
  );
};

export const parseNumber = (stringValue: string | undefined) => {
  return stringValue ? (stringValue === 'NaN' ? undefined : parseFloat(stringValue)) : undefined;
};

export const parseToTwoDecimals = (fullNumber: number) => {
  const decimalSeparation = fullNumber.toString().split('.');
  let structuredNumber;
  if (decimalSeparation.length === 1) {
    structuredNumber = decimalSeparation[0];
  } else {
    structuredNumber = `${decimalSeparation[0]}.${decimalSeparation[1].slice(0, 2)}`;
  }

  return parseFloat(structuredNumber);
};

export const arraySumAggregate = (numArrays: number[][], entryCount: number): number[] => {
  try {
    // eslint-disable-next-line no-unused-vars
    return numArrays[0].map((_, i) => numArrays.reduce((sum, arr) => sum + arr[i], 0));
  } catch {
    return new Array(entryCount).fill(0);
  }
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getFileExtension = (fileTitle: string) => {
  const fileParts = fileTitle.split('.');
  if (fileParts.length > 0) {
    const extension = fileParts[fileParts.length - 1].toLowerCase();
    if (Object.values(AcceptedFileExtensions).includes(extension as AcceptedFileExtensions)) {
      return extension;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
};

export const doesUserHaveValidatePermission = async (get: any): Promise<boolean> => {
  try {
    const response = await get('national/Users/profile');
    if (response.data && response.data.user && response.data.user.validatePermission === false) {
      return false;
    } else {
      return true;
    }
  } catch (exception) {
    return true;
  }
};

export const subtractTwoArrays = (
  array1: number[],
  array2: number[],
  multiplier?: number
): number[] => {
  const processedMultiplier = multiplier ?? 1;
  return array1.map((value, index) => (value - array2[index]) * processedMultiplier);
};

export const calculateArraySum = (array: number[]) => {
  let arrSum = 0;
  for (let index = 0; index <= array.length; index++) {
    arrSum += array[index] || 0;
  }
  return arrSum;
};

export const isGasFlowCheck = (type: ActionType | undefined): boolean => {
  if (!type) {
    return false;
  }

  if ([ActionType.MITIGATION, ActionType.CROSSCUT].includes(type)) {
    return true;
  }

  return false;
};
