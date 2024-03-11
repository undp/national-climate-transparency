import { Role } from "../casl/role.enum"
import { OrganisationType } from "../enums/organisation.type.enum"

export class JWTPayload {
    constructor(
        public cn: string,
        public n: string,
        public sub: number,
        public r: Role,
        public cid: number,
        public cr: OrganisationType,
        public s: number
    ) {

    }
}