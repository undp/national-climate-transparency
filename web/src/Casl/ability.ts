/* eslint-disable eqeqeq */
import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { BaseEntity } from '../Entities/baseEntity';
import { Action } from '../Enums/action.enum';
import { Role } from '../Enums/role.enum';
import { User } from '../Entities/user';
import { ActionEntity } from '../Entities/action';
import { Organisation } from '../Entities/organisation';
import { ProgrammeEntity } from '../Entities/programme';
import { ProjectEntity } from '../Entities/project';
import { ActivityEntity } from '../Entities/activity';
import { SupportEntity } from '../Entities/support';

type Subjects = InferSubjects<typeof BaseEntity> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export const defineAbility = () => {
  const { build } = new AbilityBuilder(createAppAbility);

  return build({
    detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
  });
};

export const updateUserAbility = (ability: AppAbility, user: User) => {
  const { can, cannot, rules } = new AbilityBuilder(createAppAbility);

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
      cannot(Action.Update, User, ['role', 'apiKey', 'password', 'email', 'organisationType']);

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

      can(Action.Read, ActivityEntity);
      can(Action.Create, ActivityEntity);
      can(Action.Update, ActivityEntity);
      can(Action.Delete, ActivityEntity);

      can(Action.Read, SupportEntity);
      can(Action.Create, SupportEntity);
      can(Action.Update, SupportEntity);
      can(Action.Delete, SupportEntity);
    }

    if (user.role == Role.Admin) {
      can(Action.Read, Organisation);
      can(Action.Create, Organisation);
      can(Action.Update, Organisation);
      can(Action.Delete, Organisation);
      cannot(Action.Update, Organisation, ['organisationType']);

      can(Action.Read, User);
      can(Action.Create, User);
      can(Action.Update, User, { role: { $ne: Role.Root } });
      can(Action.Delete, User);
      cannot(Action.Update, User, ['role', 'apiKey', 'password', 'email', 'organisationType']);

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

      can(Action.Read, ActivityEntity);
      can(Action.Create, ActivityEntity);
      can(Action.Update, ActivityEntity);
      can(Action.Delete, ActivityEntity);

      can(Action.Read, SupportEntity);
      can(Action.Create, SupportEntity);
      can(Action.Update, SupportEntity);
      can(Action.Delete, SupportEntity);
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
      cannot(Action.Update, User, ['role', 'apiKey', 'password', 'email', 'organisationType'], {
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

      can(Action.Read, ActivityEntity);
      cannot(Action.Create, ActivityEntity);
      cannot(Action.Update, ActivityEntity);
      cannot(Action.Delete, ActivityEntity);

      can(Action.Read, SupportEntity);
      cannot(Action.Create, SupportEntity);
      cannot(Action.Update, SupportEntity);
      cannot(Action.Delete, SupportEntity);
    }

    if (user.role == Role.ViewOnly) {
      can(Action.Read, Organisation);
      cannot(Action.Create, Organisation);
      cannot(Action.Update, Organisation);
      cannot(Action.Delete, Organisation);

      can(Action.Read, User);
      cannot(Action.Create, User);

      can(Action.Update, User, { id: { $eq: user.id } });
      cannot(Action.Update, User, ['role', 'apiKey', 'password', 'email', 'organisationType'], {
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

      can(Action.Read, ActivityEntity);
      cannot(Action.Create, ActivityEntity);
      cannot(Action.Update, ActivityEntity);
      cannot(Action.Delete, ActivityEntity);

      can(Action.Read, SupportEntity);
      cannot(Action.Create, SupportEntity);
      cannot(Action.Update, SupportEntity);
      cannot(Action.Delete, SupportEntity);
    }
  }

  ability.update(rules);
};
