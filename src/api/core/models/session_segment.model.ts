import { SESSION_PLAN_STATUS } from "./../types/enums/session-plan-status.enum";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableForeignKey,
  OneToMany,
  ManyToOne,
  CreateDateColumn
} from "typeorm";
import { SEGMENT_TYPE_ENUMS } from "@enums";
import Sessions from "@models/sessions.model";
import { SegmentActivity } from "@models/segment_activity.model";
require("module-alias/register");

@Entity()
export class SessionSegment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  start_time: string;

  @Column({ nullable: true })
  end_time: string;

  @Column({
    type: "enum",
    enum: SEGMENT_TYPE_ENUMS,
    default: SEGMENT_TYPE_ENUMS.PRE,
  })
  type: SEGMENT_TYPE_ENUMS;

  @Column({
    type: "enum",
    enum: SESSION_PLAN_STATUS,
    default: SESSION_PLAN_STATUS.PENDING,
  })
  session_plan_status: SESSION_PLAN_STATUS;

  @ManyToOne(() => Sessions, (session) => session.id)
  session: Sessions;

  @OneToMany(
    () => SegmentActivity,
    (segmentActivity) => segmentActivity.sessionSegment
  )
  segmentActivities: SegmentActivity[];

  @Column({ type: "text", nullable: true })
  media_attachment_ids: string;

  @Column({ type: "text", nullable: true })
  media_attachment: string;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ type: "text", nullable: true })
  activity_type: string;

  @Column({ type: "text", nullable: true })
  activity_data: string;

  @CreateDateColumn()
  created_at: Date;

  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
