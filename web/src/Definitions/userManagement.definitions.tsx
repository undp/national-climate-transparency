export interface UserData {
  key: number;
  id: number;
  name: string;
  email: string;
  phoneNo: string;
  organisation: string;
  status: string;
  role: string;
  subRole: string;
  sector: string[];
  validatePermission: string;
  subRolePermission: string;
  ghgInventoryPermission: string;
}
