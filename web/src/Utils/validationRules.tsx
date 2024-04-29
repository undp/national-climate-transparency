export const getValidationRules = (formMethod: 'create' | 'view' | 'update') => {
  return {
    required: { required: formMethod !== 'view', message: 'Required Field' },
    number: { pattern: /^[0-9]+$/, message: 'Please enter a valid number' },
    greaterThanZero: ({}) => ({
      // eslint-disable-next-line no-unused-vars
      validator(_rule: any, value: any) {
        if (value) {
          if (value > 0) {
            return Promise.resolve();
          } else {
            return Promise.reject('Need to be Greater than Zero');
          }
        } else {
          return Promise.resolve();
        }
      },
    }),
  };
};
