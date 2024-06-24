import { Sector } from "../enums/sector.enum";
import { Role, SubRole } from "../casl/role.enum"

export class JWTPayload {
    constructor(
        public cn: string,
        public n: string,
        public sub: number,
        public r: Role,
        public sr: SubRole,
		public sc: Sector[],
        public un: string,
    ) {

    }
}