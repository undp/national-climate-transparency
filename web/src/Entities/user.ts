import { BaseEntity } from './baseEntity';

export class User implements BaseEntity {
  id?: number;

  email?: string;

  role?: string;

  name?: string;

  country?: string;

  phoneNo?: string;

  organisationId?: number;

  organisationType?: string;

  // companyState?: number;
}
