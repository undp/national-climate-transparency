import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { Action } from "./action.enum";
import { Role } from "./role.enum";
import { EntitySubject } from "../entities/entity.subject";
import { Organisation } from "../entities/organisation.entity";
import { ActionEntity } from "../entities/action.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectEntity } from "src/entities/project.entity";

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
        // cannot(Action.Update, Organisation, ['organisationType']);

        can(Action.Read, User);
        can(Action.Create, User);
        can(Action.Update, User);
        can(Action.Delete, User);
        cannot(Action.Update, User, ['role', 'apiKey', 'password', 'email']);
        
        can(Action.Read, ActionEntity);
        can(Action.Create, ActionEntity);
        can(Action.Update, ActionEntity);
        can(Action.Delete, ActionEntity);

        can(Action.Read, ProgrammeEntity);
        can(Action.Create, ProgrammeEntity);
        can(Action.Update, ProgrammeEntity);
        can(Action.Delete, ProgrammeEntity);

				can(Action.Read, ProjectEntity);
        can(Action.Create, ProjectEntity);
        can(Action.Update, ProjectEntity);
        can(Action.Delete, ProjectEntity);
      }

      if (user.role == Role.Admin) {
        
        can(Action.Read, Organisation);
        can(Action.Create, Organisation);
        can(Action.Update, Organisation);
        can(Action.Delete, Organisation);
        // cannot(Action.Update, Organisation, ['organisationType']);

        can(Action.Read, User);
        can(Action.Create, User);
        can(Action.Update, User);
        can(Action.Delete, User);
        cannot(Action.Update, User, ['role', 'apiKey', 'password', 'email']);
        
        can(Action.Read, ActionEntity);
        can(Action.Create, ActionEntity);
        can(Action.Update, ActionEntity);
        can(Action.Delete, ActionEntity);

        can(Action.Read, ProgrammeEntity);
        can(Action.Create, ProgrammeEntity);
        can(Action.Update, ProgrammeEntity);
        can(Action.Delete, ProgrammeEntity);

				can(Action.Read, ProjectEntity);
        can(Action.Create, ProjectEntity);
        can(Action.Update, ProjectEntity);
        can(Action.Delete, ProjectEntity);

      }

      if (user.role == Role.GovernmentUser) {        
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

        can(Action.Read, ActionEntity);
        can(Action.Create, ActionEntity);
        can(Action.Update, ActionEntity);
        can(Action.Delete, ActionEntity);

        can(Action.Read, ProgrammeEntity);
        can(Action.Create, ProgrammeEntity);
        can(Action.Update, ProgrammeEntity);
        can(Action.Delete, ProgrammeEntity);

				can(Action.Read, ProjectEntity);
        can(Action.Create, ProjectEntity);
        can(Action.Update, ProjectEntity);
        can(Action.Delete, ProjectEntity);

      }

      if (user.role == Role.Observer) {
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

        can(Action.Read, ActionEntity);
        cannot(Action.Create, ActionEntity);
        cannot(Action.Update, ActionEntity);
        cannot(Action.Delete, ActionEntity);

        can(Action.Read, ProgrammeEntity);
        cannot(Action.Create, ProgrammeEntity);
        cannot(Action.Update, ProgrammeEntity);
        cannot(Action.Delete, ProgrammeEntity);

				can(Action.Read, ProjectEntity);
        cannot(Action.Create, ProjectEntity);
        cannot(Action.Update, ProjectEntity);
        cannot(Action.Delete, ProjectEntity);
      }


    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
