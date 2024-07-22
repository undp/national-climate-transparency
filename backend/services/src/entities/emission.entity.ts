import { Entity, Column, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { EmissionEnergyEmissions } from '../dtos/emission.energy.emissions';
import { EmissionIndustrialProcessesProductUse } from '../dtos/emission.industrial.processes.product.use';
import { EmissionAgricultureForestryOtherLandUse } from '../dtos/emission.agriculture.forestry.other.land.use';
import { EmissionWaste } from '../dtos/emission.waste';
import { EmissionOther } from '../dtos/emission.other';
import { EmissionProperties } from '../dtos/emission.properties';
import { GHGRecordState } from 'src/enums/ghg.state.enum';

@Entity()
@Unique(['year'])
export class EmissionEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  year: string;

  @Column({
    type: 'jsonb',
    array: false,
    nullable: true,
  })
  energyEmissions?: EmissionEnergyEmissions;

  @Column('jsonb', { array: false, nullable: true })
  industrialProcessesProductUse?: EmissionIndustrialProcessesProductUse;

  @Column('jsonb', { array: false, nullable: true })
  agricultureForestryOtherLandUse?: EmissionAgricultureForestryOtherLandUse;

  @Column('jsonb', { array: false, nullable: true })
  waste?: EmissionWaste;

  @Column('jsonb', { array: false, nullable: true })
  other?: EmissionOther;

  @Column('jsonb', { array: false, nullable: true })
  totalCo2WithoutLand?: EmissionProperties;

  @Column('jsonb', { array: false, nullable: true })
  totalCo2WithLand?: EmissionProperties;

  @Column({
    type: 'enum',
    enum: GHGRecordState,
    array: false,
  })
  state: GHGRecordState;
}