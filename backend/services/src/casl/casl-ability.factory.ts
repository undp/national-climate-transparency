import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from "@casl/ability";
import { Injectable, ForbiddenException } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { Action } from "./action.enum";
import { Role } from "./role.enum";
import { EntitySubject } from "../entities/entity.subject";
import { Organisation } from "../entities/organisation.entity";

type Subjects = InferSubjects<typeof EntitySubject> | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

const unAuthErrorMessage = "This action is unauthorised";

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    console.log("createForUser", user);
    const { can, cannot, build } = new AbilityBuilder(createAppAbility);
    if (user) {
      if (user.role == Role.Root) {
        
        can(Action.Read, Organisation);
        can(Action.Create, Organisation);
        can(Action.Update, Organisation);
        can(Action.Delete, Organisation);
        cannot(Action.Update, Organisation, ['organisationType']);

        can(Action.Read, User);
        can(Action.Create, User);
        can(Action.Update, User);
        can(Action.Delete, User);
        cannot(Action.Update, User, ['role', 'apiKey', 'password', 'email']);
        
      }

      if (user.role == Role.Admin) {
        
        can(Action.Read, Organisation);
        can(Action.Create, Organisation);
        can(Action.Update, Organisation);
        can(Action.Delete, Organisation);
        cannot(Action.Update, Organisation, ['organisationType']);

        can(Action.Read, User);
        can(Action.Create, User);
        can(Action.Update, User);
        can(Action.Delete, User);
        cannot(Action.Update, User, ['role', 'apiKey', 'password', 'email']);
        
      }

      if (user.role == Role.DepartmentUser) {        
        can(Action.Read, Organisation);
        cannot(Action.Create, Organisation);
        cannot(Action.Update, Organisation);
        cannot(Action.Delete, Organisation);

        can(Action.Read, User);
        cannot(Action.Create, User);
        cannot(Action.Delete, User);
        can(Action.Update, User, { id: { $eq: user.id } });
        cannot(Action.Update, User, ['role', 'apiKey', 'password', 'email'], {
          id: { $eq: user.id },
        });
      }

      if (user.role == Role.ViewOnly) {
        can(Action.Read, Organisation);
        cannot(Action.Create, Organisation);
        cannot(Action.Update, Organisation);
        cannot(Action.Delete, Organisation);

        can(Action.Read, User);
        cannot(Action.Create, User);

        can(Action.Update, User, { id: { $eq: user.id } });
        cannot(Action.Update, User, ['role', 'apiKey', 'password', 'email'], {
          id: { $eq: user.id },
        });
      }


    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
