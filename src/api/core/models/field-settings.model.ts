import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class FieldSettings {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({default : false  })
  is_selected: boolean;

  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
