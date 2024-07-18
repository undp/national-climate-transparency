const programmeFormOptionals = ['comments'];

const projectFormOptionals = [
  'additionalProjectNumber',
  'internationalImplementingEntities',
  'comment',
];

const activityFormOptionals = [
  'measure',
  'nationalImplementingEntity',
  'internationalImplementingEntity',
  'anchoredInNationalStrategy',
  'meansOfImplementation',
  'technologyType',
  'etfDescription',
  'comment',
];

const supportFormOptionals = [
  'internationalSource',
  'nationalSource',
  'financingStatus',
  'nationalFinancialInstrument',
  'internationalFinancialInstrument',
  'internationalSupportChannel',
];

export const processOptionalFields = (
  payload: any,
  calledIn: 'action' | 'programme' | 'project' | 'activity' | 'support'
) => {
  let optionalFields: string[] = [];
  switch (calledIn) {
    case 'action':
      break;
    case 'programme':
      optionalFields = programmeFormOptionals;
      break;
    case 'project':
      optionalFields = projectFormOptionals;
      break;
    case 'activity':
      optionalFields = activityFormOptionals;
      break;
    case 'support':
      optionalFields = supportFormOptionals;
      break;
  }

  const transformedPayload = { ...payload };

  for (const key of optionalFields) {
    if (transformedPayload.hasOwnProperty(key)) {
      if (typeof transformedPayload[key] === 'string' && transformedPayload[key] === '') {
        transformedPayload[key] = null;
      } else if (transformedPayload[key] instanceof Array && transformedPayload[key].length === 0) {
        transformedPayload[key] = null;
      } else if (typeof transformedPayload[key] === 'undefined') {
        transformedPayload[key] = null;
      }
    }
  }

  return transformedPayload;
};
