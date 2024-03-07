import { BaseEntity } from './baseEntity';

export class Organisation implements BaseEntity {
  organisationId?: number;

  name?: string;

  email?: string;

  phoneNo?: string;

  website?: string;

  address?: string;

  logo?: string;

  country?: string;

  organisationType?: string;
}
