export interface UserTableDataType {
  id?: number;
  name?: string;
  phoneNo?: string;
  role?: string;
  email?: string;
  organisationId?: number;
  organisationType?: string;
  organisation: {
    name?: string;
    address?: string;
    organisationId?: number;
    organisationType?: string;
    country?: string;
    email?: string;
    phoneNo?: string;
    taxId?: string;
    website?: string;
    state?: string;
    logo?: string;
  };
  state: number;
}
