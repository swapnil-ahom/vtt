require('module-alias/register');
import * as Dayjs from 'dayjs';
import * as Jwt from 'jwt-simple';
import * as Bcrypt from 'bcrypt';
import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate, AfterLoad, BeforeInsert, OneToMany, OneToOne, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { badImplementation } from '@hapi/boom';
import { ACCESS_TOKEN } from '@config/environment.config';
import { STATUS } from '@enums';
import { Status } from '@types';
import { Media } from '@models/media.model';
import { IModel } from '@interfaces';
import { Role } from '@models/role.model';
import { RoleMapping } from '@models/role-mapping.model';
import { SubscriptionPlans } from '@models/subscriptionplans.model';

@Entity('user')
export class User implements IModel {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 36,
    unique: true
  })
  username: string;

  @Column({
    length: 50
  })
  fullname: string;

  @OneToOne(() => Media, { nullable: true })
  @JoinColumn()
  avatar: Media;

  @Column({
    length: 128,
    unique: true
  })
  email: string;

  @Column({
    type: 'enum',
    enum: STATUS,
    default: STATUS.REGISTERED
  })
  status: Status;

  @Column({
    length: 128
  })
  password: string;

  @Column({
    length: 128,
    unique: true
  })
  apikey: string;

  // @Column({
  //   type: 'enum',
  //   enum: ROLE,
  //   default: ROLE.user
  // })
  // role: Role

  @Column({nullable: true})
  roleId: number

  @ManyToMany(() => Role)
  role: Role;

  @OneToMany( () => RoleMapping, rMapping => rMapping.user, {
    onDelete: 'CASCADE'
  })
  roleMapping: RoleMapping[];

  @OneToMany( () => Media, media => media.owner, {
    eager: true
  })
  medias: Media[];

  @Column({
    type: Date,
    default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
  })
  createdAt;

  @Column({
    type: Date,
    default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
  })
  updatedAt;

  @Column({
    type: Date,
    default: null
  })
  deletedAt;

  @Column({})
  otp: number;

  @Column({default : false  })
  is_verify_otp: boolean;

  @Column({})
  social_type: string;

  @Column({
    default: null,
    nullable: true,
  })
  experienceAsTrainer: number;

  @Column({
    default: null,
    nullable: true,
  })
  areaOfExpertise: string;

  @Column({
    default: null,
    nullable: true,
  })
  sectorCaterTo: string;

  @Column({
    default: null,
    nullable: true,
  })
  age_group : string;

  @Column({
    default: null,
    nullable: true,
  })
  trainer : string;

  @Column({
    default: null,
    nullable: true,
  })
  educational_qualification : string;

  @Column({
    default: null,
    nullable: true,
  })
  hobbies : string;

  @Column({
    default: null,
    nullable: true,
  })
  roleName : string;

  @Column({
    default: null,
    nullable: true,
  })
  town_city: string;

  @Column({
    default: null,
    nullable: true,
  })
  country: string;

  @Column({
    default: null,
    nullable: true,
  })
  website: string;

  @Column({
    default: null,
    nullable: true,
  })
  industry: string;

  @Column({
    default: null,
    nullable: true,
  })
  organisationName: string;

  @Column({
    default: null,
    nullable: true,
  })
  address: string;

  @Column({
    default: null,
    nullable: true,
  })
  nationality: string;

  @Column({
    default: null,
    nullable: true,
  })
  contactNumber: string;

  @Column({
    default: null,
    nullable: true,
  })
  micrositeLink: string;

  @Column({
    type : 'text',
    default: null,
    nullable: true,
  })
  shortBio: string;

  @Column({
    default: null,
    nullable: true,
  })
  resume: string;

  @Column({
    default: null,
    nullable: true,
  })
  videoOrAttachments: string;

  @Column({
    type:'text',
    default: null,
    nullable: true,
  })
  profilePhoto: string;

  @Column({
    default: null,
    nullable: true,
  })
  facebookLink: string;

  @Column({
    default: null,
    nullable: true,
  })

  instagramLink: string;

  @Column({
    default: null,
    nullable: true,
  })
  linkedinLink: string;

  @Column({
    default: null,
    nullable: true,
  })
  pinterestLink: string;

  // @OneToMany( () => SubscriptionPlans, sPlan => sPlan.user)
  // subscriptionPlans: SubscriptionPlans[];

  @ManyToOne(()=> SubscriptionPlans,
  {
    nullable: true,
  }
  )
  subscription: SubscriptionPlans;

  @Column({
    default: null,
    nullable: true,
  })
  profileCompletion: string;

  /**
   * @description
   */
  private temporaryPassword;
  trainee_email: string;

  /**
   * @param payload Object data to assign
   */
  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }

  @AfterLoad()
  storeTemporaryPassword() : void {
    this.temporaryPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<string|boolean> {
    try {
      if (this.temporaryPassword === this.password) {
        return true;
      }
      this.password = await Bcrypt.hash(this.password, 10);
      return true;
    } catch (error) {
      throw badImplementation();
    }
  }

  /**
   * @description Check that password matches
   *
   * @param password
   */
  async passwordMatches(password: string): Promise<boolean> {
    return await Bcrypt.compare(password, this.password);
  }

  /**
   * @description Generate JWT access token
   */
   token(duration: number = null): string {
    const payload = {
      exp: Dayjs().add(duration || ACCESS_TOKEN.DURATION, 'minutes').unix(),
      iat: Dayjs().unix(),
      sub: this.id
    };
    return Jwt.encode(payload, ACCESS_TOKEN.SECRET);
  }

  /**
   * @description Filter on allowed entity fields
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  get whitelist(): string[] {
    return [
      'id',
      'username',
      'fullname',
      'avatar',
      'email',
      'role',
      'createdAt' ,
      'updatedAt'
    ]
  }

}
