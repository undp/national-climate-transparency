export enum InvestmentStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
}

export const getStatusTagType = (status: InvestmentStatus) => {
  switch (status) {
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
