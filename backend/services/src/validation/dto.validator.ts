import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class PropertyCannotExistConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const restrainingPropertyName = args.constraints[0];
        const restrainedOn = args.constraints[1];
        const restrainingPropertyValue = (args.object as any)[restrainingPropertyName];
        if (value && restrainingPropertyValue === restrainedOn) {
            return false;
        }
        return true;
    }
}

export function PropertyCannotExist(restrainingPropertyName: string, restrainedOn: any, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [restrainingPropertyName, restrainedOn],
            validator: PropertyCannotExistConstraint,
        });
    };
}

// Example Usage

// @PropertyCannotExist('financeNature', FinanceNature.INTERNATIONAL, {
//     message: 'National Financial Instrument Cannot be provided when financeNature is International',
// })
