export enum NdcActionTypes {
  Mitigation,
  Adaptation,
  CrossCutting,
  Enablement,
}

export const ndcActionTypeList = [
  { value: NdcActionTypes.Adaptation.valueOf(), label: 'Adaptation' },
  { value: NdcActionTypes.CrossCutting.valueOf(), label: 'Cross-cutting' },
  { value: NdcActionTypes.Enablement.valueOf(), label: 'Enablement' },
  { value: NdcActionTypes.Mitigation.valueOf(), label: 'Mitigation' },
];
