export enum InvestmentStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
}

export const getStageEnumVal = (value: string) => {
  const index = Object.keys(InvestmentStatus).indexOf(value);
  if (index < 0) {
    return value;
  }
  return Object.values(InvestmentStatus)[index];
};

export const getStatusTagType = (status: InvestmentStatus) => {
  switch (getStageEnumVal(status)) {
    case InvestmentStatus.REJECTED:
      return 'error';
    case InvestmentStatus.PENDING:
      return 'processing';
    case InvestmentStatus.APPROVED:
      return 'success';
    default:
      return 'default';
  }
};
