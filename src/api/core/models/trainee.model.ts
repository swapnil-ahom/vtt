/* eslint-disable @typescript-eslint/member-ordering */
import { date } from 'joi';
import * as Dayjs from 'dayjs';
import * as Jwt from 'jwt-simple';
import * as Bcrypt from 'bcrypt';
import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate, AfterLoad, BeforeInsert, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { badImplementation } from '@hapi/boom';
import { ACCESS_TOKEN } from '@config/environment.config';
import { RoleIds, STATUS } from '@enums';
import { Role, Status } from '@types';
import { Media } from '@models/media.model';
import { IModel } from '@interfaces';
@Entity()
export class Trainee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
      default:null
    })
    trainee_name : string;


    @Column({
      default:null
    })
    trainee_email: string ;

    @Column({
      default:null
    })
    trainee_password : string;

    @Column({
      default:null
    })
    social_media_id : string;

    @Column({
      default:null
    })
    social_media_type : string;

    @Column({
      default:null
    })
    isActive : boolean;

    @Column({
      default:null
    })
    created_at : Date;

    @Column({
      default:null
    })
    otp : number;

    @Column({default : false  })
    is_verify_otp: boolean;

    @Column({
      default:null
    })
    first_name : string;

    @Column({
      default:null
    })
    last_name : string;

    @Column({
      default:null
    })
    age_group : string;

    @Column({
      default:null
    })
    industry : string;

    @Column({
      default:null
    })
    organization : string;

    @Column({
      default:null
    })
    role : string;

    @Column({
      default:null
    })
    town_city : string;

    @Column({
      default:null
    })
    country : string;

    @Column({
      default:null
    })
    website : string;

    @Column({
      default:null,
      type:'text'
    })
    hobbies : string;

    @Column({
      default:null
    })
    trainer : string;

    @Column({
      default:null,
      type:'text'
    })
    short_bio : string;

    @Column({
      default:null,
      type:'text'
    })
    educational_qualification : string;

    @Column({
      default:null
    })
    trainer_experience : number;

    @Column({
      default:null
    })
    areas_of_expertise : string;

    @Column({
      default:null
    })
    sectors_of_cater : string;

    @Column({
      default:null,
      type:'text'
    })
    profile_photo : string;

    @Column({
      default:null,
      type:'text'
    })
    profile_video : string;

    @Column({
      default:null,
      type:'text'
    })
    pdf_profile : string;

    @Column({
      default: null,
      nullable: true,
    })
    profileCompletion: string;

    /**
     * @description Generate JWT access token
     */
   token(duration: number = null): string {
    const payload = {
      exp: Dayjs().add(duration || ACCESS_TOKEN.DURATION, 'minutes').unix(),
      iat: Dayjs().unix(),
      sub: this.id,
      type :'trainee',
      email:this.trainee_email
    };
    return Jwt.encode(payload, ACCESS_TOKEN.SECRET);
  }

/**
 * @description
 */
 private temporaryPassword;

 /**
  * @param payload Object data to assign
  */
 constructor(payload: Record<string, unknown>) {
   Object.assign(this, payload);
 }

  @AfterLoad()
  storeTemporaryPassword() : void {
    this.temporaryPassword = this.trainee_password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<string|boolean> {
    try {
      if (this.temporaryPassword === this.trainee_password) {
        return true;
      }
      this.trainee_password = await Bcrypt.hash(this.trainee_password, 10);
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

    return await Bcrypt.compare(password,this.trainee_password);
  }

}