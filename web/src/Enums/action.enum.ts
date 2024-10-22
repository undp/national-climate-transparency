export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Approve = 'approve',
  Reject = 'reject',
  Validate = 'validate',
}

export enum ActionType {
  MITIGATION = 'Mitigation',
  ADAPTION = 'Adaption',
  CROSSCUT = 'Cross-cutting',
  TRANSPARENCY = 'Transparency',
  OTHER = 'Other',
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
