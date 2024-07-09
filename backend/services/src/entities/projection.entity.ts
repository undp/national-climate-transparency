import { Entity, Column, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { GHGRecordState } from 'src/enums/ghg.state.enum';
import { ProjectionAgricultureForestryOtherLandUse, ProjectionEnergyEmissions, ProjectionIndustrialProcessesProductUse, ProjectionOther, ProjectionProperties, ProjectionWaste } from 'src/dtos/projection.dto';
import { ProjectionType } from 'src/enums/projection.enum';

@Entity()
@Unique(['year'])
export class ProjectionEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  year: string;

  @Column({ type: "enum", enum: ProjectionType, nullable: false })
  projectionType: string;

  @Column({
    type: 'jsonb',
    array: false,
    nullable: true,
  })
  energyEmissions?: ProjectionEnergyEmissions;

  @Column('jsonb', { array: false, nullable: true })
  industrialProcessesProductUse?: ProjectionIndustrialProcessesProductUse;

  @Column('jsonb', { array: false, nullable: true })
  agricultureForestryOtherLandUse?: ProjectionAgricultureForestryOtherLandUse;

  @Column('jsonb', { array: false, nullable: true })
  waste?: ProjectionWaste;

  @Column('jsonb', { array: false, nullable: true })
  other?: ProjectionOther;

  @Column('jsonb', { array: false, nullable: true })
  totalCo2WithoutLand?: ProjectionProperties;

  @Column('jsonb', { array: false, nullable: true })
  totalCo2WithLand?: ProjectionProperties;

  @Column({
    type: 'enum',
    enum: GHGRecordState,
    array: false,
  })
  state: GHGRecordState;

  @Column({ type: "boolean", default: false })
	isBaseline: boolean;
}