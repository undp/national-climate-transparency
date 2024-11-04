import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ProjectStatus } from "../enums/project.enum";
import { Recipient, IntImplementor } from "../enums/shared.enum";
import { ProgrammeEntity } from "./programme.entity";
import { ActivityEntity } from "./activity.entity";
import { Sector } from "../enums/sector.enum";
import { ActionType } from "../enums/action.enum";

@Entity('project')
export class ProjectEntity {
  @PrimaryColumn()
  projectId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  additionalProjectNumber: string;

  @Column({ type: "enum", enum: ProjectStatus })
  projectStatus: string;

  @Column()
  startYear: number;

  @Column()
  endYear: number;

  @Column({ nullable: true })
  expectedTimeFrame: number;

  @Column({ type: 'jsonb', nullable: true })
  documents: any;

  @Column({ nullable: true })
  comment: string;

	@Column({ type: "enum", enum: Sector, nullable: true })
  sector: Sector;

  @Column({ type: "ltree" })
  path: string;

  @ManyToOne(() => ProgrammeEntity, (programme) => programme.projects, {
    nullable: true,
  })
  @JoinColumn([{ name: "programmeId", referencedColumnName: "programmeId" }])
  programme: ProgrammeEntity;

	activities?: ActivityEntity[];

	@Column({ type: "boolean", default: false })
	validated: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	createdTime: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updatedTime: Date;
	
}
