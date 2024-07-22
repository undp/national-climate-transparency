import {
	AbilityBuilder,
	CreateAbility,
	createMongoAbility,
	ExtractSubjectType,
	InferSubjects,
	MongoAbility,
	MongoQuery,
} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { Action } from "./action.enum";
import { Role } from "./role.enum";
import { EntitySubject } from "../entities/entity.subject";
import { ActionEntity } from "../entities/action.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectEntity } from "../entities/project.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { SupportEntity } from "../entities/support.entity";
import { KpiEntity } from "../entities/kpi.entity";
import { EmissionEntity } from "src/entities/emission.entity";
import { ProjectionEntity } from "src/entities/projection.entity";
import { ConfigurationSettingsEntity } from "src/entities/configuration.settings.entity";
import { SystemResourcesEntity } from "src/entities/systemResource.entity";

type Subjects = InferSubjects<typeof EntitySubject> | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

@Injectable()
export class CaslAbilityFactory {
	createForUser(user: User) {
		console.log("createForUser", user);
		const { can, cannot, build } = new AbilityBuilder(createAppAbility);
		if (user) {
			if (user.role == Role.Root) {

				// User
				can(Action.Read, User);
				can(Action.Create, User);
				can(Action.Update, User);
				can(Action.Delete, User);
				cannot(Action.Update, User, ['apiKey', 'password', 'email']);
				can(Action.ForceResetPassword, User);

				// Action
				can(Action.Read, ActionEntity);
				can(Action.Create, ActionEntity);
				can(Action.Update, ActionEntity);
				can(Action.Delete, ActionEntity);
				can(Action.Validate, ActionEntity);

				// Programme
				can(Action.Read, ProgrammeEntity);
				can(Action.Create, ProgrammeEntity);
				can(Action.Update, ProgrammeEntity);
				can(Action.Delete, ProgrammeEntity);
				can(Action.Validate, ProgrammeEntity);
				
				// Project
				can(Action.Read, ProjectEntity);
				can(Action.Create, ProjectEntity);
				can(Action.Update, ProjectEntity);
				can(Action.Delete, ProjectEntity);
				can(Action.Validate, ProjectEntity);

				// Activity
				can(Action.Read, ActivityEntity);
				can(Action.Create, ActivityEntity);
				can(Action.Update, ActivityEntity);
				can(Action.Delete, ActivityEntity);
				can(Action.Validate, ActivityEntity);

				// Support
				can(Action.Read, SupportEntity);
				can(Action.Create, SupportEntity);
				can(Action.Update, SupportEntity);
				can(Action.Delete, SupportEntity);
				can(Action.Validate, SupportEntity);

				// KPI
				can(Action.Read, KpiEntity);
				can(Action.Create, KpiEntity);
				can(Action.Update, KpiEntity);
				can(Action.Delete, KpiEntity);

				//Emission
				can(Action.Read, EmissionEntity);
				can(Action.Create, EmissionEntity);
				can(Action.Update, EmissionEntity);
				can(Action.Delete, EmissionEntity);
				can(Action.Validate, EmissionEntity);

				//Projection
				can(Action.Read, ProjectionEntity);
				can(Action.Create, ProjectionEntity);
				can(Action.Update, ProjectionEntity);
				can(Action.Delete, ProjectionEntity);
				can(Action.Validate, ProjectionEntity);

				// Settings
				can(Action.Read, ConfigurationSettingsEntity);
				can(Action.Create, ConfigurationSettingsEntity);
				can(Action.Update, ConfigurationSettingsEntity);

				// Settings
				can(Action.Read, SystemResourcesEntity);
				can(Action.Create, SystemResourcesEntity);
				can(Action.Delete, SystemResourcesEntity);
			}

			if (user.role == Role.Admin) {

				// User
				can(Action.Read, User);
				can(Action.Create, User);
				can(Action.Update, User);
				can(Action.Delete, User);
				cannot(Action.Update, User, ['apiKey', 'password', 'email']);
				cannot(Action.ForceResetPassword, User);

				// Action
				can(Action.Read, ActionEntity);
				can(Action.Create, ActionEntity);
				can(Action.Update, ActionEntity);
				can(Action.Delete, ActionEntity);
				can(Action.Validate, ActionEntity);

				// Programme
				can(Action.Read, ProgrammeEntity);
				can(Action.Create, ProgrammeEntity);
				can(Action.Update, ProgrammeEntity);
				can(Action.Delete, ProgrammeEntity);
				can(Action.Validate, ProgrammeEntity);

				// Project
				can(Action.Read, ProjectEntity);
				can(Action.Create, ProjectEntity);
				can(Action.Update, ProjectEntity);
				can(Action.Delete, ProjectEntity);
				can(Action.Validate, ProjectEntity);

				// Activity
				can(Action.Read, ActivityEntity);
				can(Action.Create, ActivityEntity);
				can(Action.Update, ActivityEntity);
				can(Action.Delete, ActivityEntity);
				can(Action.Validate, ActivityEntity);

				// Support
				can(Action.Read, SupportEntity);
				can(Action.Create, SupportEntity);
				can(Action.Update, SupportEntity);
				can(Action.Delete, SupportEntity);
				can(Action.Validate, SupportEntity);

				// KPI
				can(Action.Read, KpiEntity);
				can(Action.Create, KpiEntity);
				can(Action.Update, KpiEntity);
				can(Action.Delete, KpiEntity);

				//Emission
				can(Action.Read, EmissionEntity);
				can(Action.Create, EmissionEntity);
				can(Action.Update, EmissionEntity);
				can(Action.Delete, EmissionEntity);
				can(Action.Validate, EmissionEntity);

				//Projection
				can(Action.Read, ProjectionEntity);
				can(Action.Create, ProjectionEntity);
				can(Action.Update, ProjectionEntity);
				can(Action.Delete, ProjectionEntity);
				can(Action.Validate, ProjectionEntity);

				// Settings
				can(Action.Read, ConfigurationSettingsEntity);
				cannot(Action.Create, ConfigurationSettingsEntity);
				cannot(Action.Update, ConfigurationSettingsEntity);

				// Settings
				can(Action.Read, SystemResourcesEntity);
			}

			if (user.role == Role.GovernmentUser) {

				// User
				can(Action.Read, User);
				cannot(Action.Create, User);
				cannot(Action.Delete, User);
				can(Action.Update, User, { id: { $eq: user.id } });
				cannot(Action.Update, User, ['apiKey', 'password', 'email'], {
					id: { $eq: user.id },
				});
				cannot(Action.ForceResetPassword, User);

				// ----------------------------- Action ------------------------------

				user.sector.forEach(userSector => {
					can(Action.Read, ActionEntity, {
						$or: [{ sector: { $elemMatch: { $eq: userSector } } }]
					} as MongoQuery<ActionEntity>);
				});

				can(Action.Create, ActionEntity);
				can(Action.Update, ActionEntity);
				can(Action.Delete, ActionEntity);
				can(Action.Validate, ActionEntity);

				
				// ----------------------------- Programme ------------------------------

				user.sector.forEach(userSector => {
					can(Action.Read, ProgrammeEntity, {
						$or: [{ sector: { $elemMatch: { $eq: userSector } } }]
					} as MongoQuery<ProgrammeEntity>);
				});

				can(Action.Read, ProgrammeEntity, {
					sector: { $exists: false }
				} as MongoQuery<ProgrammeEntity>);
				

				can(Action.Create, ProgrammeEntity);
				can(Action.Update, ProgrammeEntity);
				can(Action.Delete, ProgrammeEntity);
				can(Action.Validate, ProgrammeEntity);

				// ----------------------------- Project ------------------------------

				user.sector.forEach(userSector => {
					can(Action.Read, ProjectEntity, {
						$or: [{ sector: { $elemMatch: { $eq: userSector } } }]
					} as MongoQuery<ProjectEntity>);
				});

				can(Action.Read, ProjectEntity, {
					sector: { $exists: false }
				} as MongoQuery<ProjectEntity>);

				can(Action.Create, ProjectEntity);
				can(Action.Update, ProjectEntity);
				can(Action.Delete, ProjectEntity);
				can(Action.Validate, ProjectEntity);
				
				// ----------------------------- Activity ------------------------------

				user.sector.forEach(userSector => {
					can(Action.Read, ActivityEntity, {
						$or: [{ sector: { $elemMatch: { $eq: userSector } } }]
					} as MongoQuery<ActivityEntity>);
				});

				can(Action.Read, ActivityEntity, {
					sector: { $exists: false }
				} as MongoQuery<ActivityEntity>);

				can(Action.Create, ActivityEntity);
				can(Action.Update, ActivityEntity);
				can(Action.Delete, ActivityEntity);
				can(Action.Validate, ActivityEntity);

				// ----------------------------- Support ------------------------------

				user.sector.forEach(userSector => {
					can(Action.Read, SupportEntity, {
						$or: [{ sector: { $elemMatch: { $eq: userSector } } }]
					} as MongoQuery<SupportEntity>);
				});

				can(Action.Read, SupportEntity, {
					sector: { $exists: false }
				} as MongoQuery<SupportEntity>);

				can(Action.Create, SupportEntity);
				can(Action.Update, SupportEntity);
				can(Action.Delete, SupportEntity);
				can(Action.Validate, SupportEntity);

				// ----------------------------- KPI ------------------------------
				can(Action.Read, KpiEntity);
				can(Action.Create, KpiEntity);
				can(Action.Update, KpiEntity);
				can(Action.Delete, KpiEntity);

				//Emission
				can(Action.Read, EmissionEntity);
				can(Action.Create, EmissionEntity);
				can(Action.Update, EmissionEntity);
				can(Action.Delete, EmissionEntity);
				can(Action.Validate, EmissionEntity);

				//Projection
				can(Action.Read, ProjectionEntity);
				can(Action.Create, ProjectionEntity);
				can(Action.Update, ProjectionEntity);
				can(Action.Delete, ProjectionEntity);
				can(Action.Validate, ProjectionEntity);

				// Settings
				can(Action.Read, ConfigurationSettingsEntity);
				cannot(Action.Create, ConfigurationSettingsEntity);
				cannot(Action.Update, ConfigurationSettingsEntity);

				// Settings
				can(Action.Read, SystemResourcesEntity);

			}

			if (user.role == Role.Observer) {

				can(Action.Read, User);
				cannot(Action.Create, User);
				can(Action.Update, User, { id: { $eq: user.id } });
				cannot(Action.Update, User, ['apiKey', 'password', 'email'], {
					id: { $eq: user.id },
				});
				cannot(Action.ForceResetPassword, User);

				// ----------------------------- Action ------------------------------

				user.sector.forEach(userSector => {
					can(Action.Read, ActionEntity, {
						$or: [{ sector: { $elemMatch: { $eq: userSector } } }]
					} as MongoQuery<ActionEntity>);
				});

				cannot(Action.Create, ActionEntity);
				cannot(Action.Update, ActionEntity);
				cannot(Action.Delete, ActionEntity);
				cannot(Action.Validate, ActionEntity);

				// ----------------------------- Programme ------------------------------

				user.sector.forEach(userSector => {
					can(Action.Read, ProgrammeEntity, {
						$or: [{ sector: { $elemMatch: { $eq: userSector } } }]
					} as MongoQuery<ProgrammeEntity>);
				});

				can(Action.Read, ProgrammeEntity, {
					sector: { $exists: false }
				} as MongoQuery<ProgrammeEntity>);

				cannot(Action.Create, ProgrammeEntity);
				cannot(Action.Update, ProgrammeEntity);
				cannot(Action.Delete, ProgrammeEntity);
				cannot(Action.Validate, ProgrammeEntity);

				// ----------------------------- Project ------------------------------

				user.sector.forEach(userSector => {
					can(Action.Read, ProjectEntity, {
						$or: [{ sector: { $elemMatch: { $eq: userSector } } }]
					} as MongoQuery<ProjectEntity>);
				});

				can(Action.Read, ProjectEntity, {
					sector: { $exists: false }
				} as MongoQuery<ProjectEntity>);
				
				cannot(Action.Create, ProjectEntity);
				cannot(Action.Update, ProjectEntity);
				cannot(Action.Delete, ProjectEntity);
				cannot(Action.Validate, ProjectEntity);

				// ----------------------------- Activity ------------------------------

				user.sector.forEach(userSector => {
					can(Action.Read, ActivityEntity, {
						$or: [{ sector: { $elemMatch: { $eq: userSector } } }]
					} as MongoQuery<ActivityEntity>);
				});

				can(Action.Read, ActivityEntity, {
					sector: { $exists: false }
				} as MongoQuery<ActivityEntity>);
				
				cannot(Action.Create, ActivityEntity);
				cannot(Action.Update, ActivityEntity);
				cannot(Action.Delete, ActivityEntity);
				cannot(Action.Validate, ActivityEntity);

				// ----------------------------- Support ------------------------------

				user.sector.forEach(userSector => {
					can(Action.Read, SupportEntity, {
						$or: [{ sector: { $elemMatch: { $eq: userSector } } }]
					} as MongoQuery<SupportEntity>);
				});

				can(Action.Read, SupportEntity, {
					sector: { $exists: false }
				} as MongoQuery<SupportEntity>);

				cannot(Action.Create, SupportEntity);
				cannot(Action.Update, SupportEntity);
				cannot(Action.Delete, SupportEntity);
				cannot(Action.Validate, SupportEntity);

				// ----------------------------- KPI ------------------------------

				can(Action.Read, KpiEntity);
				cannot(Action.Create, KpiEntity);
				cannot(Action.Update, KpiEntity);
				cannot(Action.Delete, KpiEntity);

				//Emission
				can(Action.Read, EmissionEntity);
				cannot(Action.Create, EmissionEntity);
				cannot(Action.Update, EmissionEntity);
				cannot(Action.Delete, EmissionEntity);
				cannot(Action.Validate, EmissionEntity);

				//Projection
				can(Action.Read, ProjectionEntity);
				cannot(Action.Create, ProjectionEntity);
				cannot(Action.Update, ProjectionEntity);
				cannot(Action.Delete, ProjectionEntity);
				cannot(Action.Validate, ProjectionEntity);

				// Settings
				can(Action.Read, ConfigurationSettingsEntity);
				cannot(Action.Create, ConfigurationSettingsEntity);
				cannot(Action.Update, ConfigurationSettingsEntity);

				// Settings
				can(Action.Read, SystemResourcesEntity);
			}

		}

		return build({
			detectSubjectType: (item) =>
				item.constructor as ExtractSubjectType<Subjects>,
		});
	}
}
