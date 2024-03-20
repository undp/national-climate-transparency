export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Approve = 'approve',
  Reject = 'reject',
}

export enum InstrumentType {
  POLICY = 'Policy',
  REGULATORY = 'Regulatory',
  ECONOMIC = 'Economic',
  OTHER = 'Other',
}

export enum ActionStatus {
  PLANNED = 'Planned',
  ADOPTED = 'Adopted',
  IMPLEMENTED = 'Implemented',
}

export enum NatAnchor {
  NDC = 'NDC',
  NAP = 'NAP',
  NDP = 'NDP',
  OTHER = 'Other',
}
