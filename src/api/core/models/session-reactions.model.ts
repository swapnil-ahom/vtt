import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { REACTION_TYPE_ENUM } from "../types/enums/reaction-type.enum";
import { REACTED_BY_TYPE_ENUM } from "../types/enums/reacted-by-type.enum";

@Entity()
export class Session_Reactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: null,
  })
  session_map_id: number;

  @Column({
    type: "enum",
    enum: REACTION_TYPE_ENUM,
    default: REACTION_TYPE_ENUM.null,
  })
  reaction_type: REACTION_TYPE_ENUM;

  @Column({
    default: null,
  })
  reacted_by : string;

  @Column({
    type: "enum",
    enum: REACTED_BY_TYPE_ENUM,
    default: REACTED_BY_TYPE_ENUM.null,
  })
  reacted_by_type: REACTED_BY_TYPE_ENUM;

  @Column({
    type: Date,
    default: null,
    nullable: true,
  })
  reaction_time;


}
