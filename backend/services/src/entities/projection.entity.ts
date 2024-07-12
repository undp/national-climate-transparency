import { Entity, Column, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { GHGRecordState } from 'src/enums/ghg.state.enum';
import { ProjectionType } from 'src/enums/projection.enum';
import { ProjectionData } from 'src/dtos/projection.dto';

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
  projectionData?: ProjectionData;

  @Column({
    type: 'enum',
    enum: GHGRecordState,
    array: false,
  })
  state: GHGRecordState;
}