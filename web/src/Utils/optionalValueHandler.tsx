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
  'otherNationalFinancialInstrument',
  'internationalSource',
  'nationalSource',
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

  for (const key in payload) {
    if (optionalFields.includes(key)) {
      try {
        if (payload[key] && (payload[key] === '' || payload[key].length === 0)) {
          console.log('Optional Field Detected in', calledIn, key, payload[key]);
          // payload[key] = null;
        }
      } catch {
        console.log('Optional Field Detection Failed in', calledIn, key, payload[key]);
      }
    }
  }

  return payload;
};
