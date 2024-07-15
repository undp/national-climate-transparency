import { Entity, Column, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { GHGRecordState } from 'src/enums/ghg.state.enum';
import { ExtendedProjectionType } from 'src/enums/projection.enum';
import { ProjectionData } from 'src/dtos/projection.dto';

@Entity()
@Unique(['projectionType'])
export class ProjectionEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: "enum", enum: ExtendedProjectionType, nullable: false })
  projectionType: string;

  @Column({
    type: 'jsonb',
    array: false,
    nullable: true,
  })
  projectionData?: ProjectionData;

  @Column({
    type: 'enum',
    enum: GHGRecordState,
    array: false,
  })
  state: GHGRecordState;
}