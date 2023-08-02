export enum NdcActionStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
}

export const getStageEnumVal = (value: string) => {
  const index = Object.keys(NdcActionStatus).indexOf(value);
  if (index < 0) {
    return value;
  }
  return Object.values(NdcActionStatus)[index];
};

export const getNdcStatusTagType = (status: NdcActionStatus) => {
  switch (getStageEnumVal(status)) {
    case NdcActionStatus.PENDING:
      return 'processing';
    case NdcActionStatus.APPROVED:
      return 'success';
    default:
      return 'default';
  }
};
