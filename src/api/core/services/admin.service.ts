/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Service} from "typedi";
import {User} from "@models/user.model";
import {getConnectionManager, getRepository, In, Repository} from "typeorm";
import {SubUserModel} from "@models/sub-user.model";
import { Logger } from "@services/logger.service";
import {
    AssignRoleVO,
    CreateSubUsersVO,
    CreateUserVO,
    DeleteSubUserVO,
    UpdateSubUserVO
} from "../types/uiVOs/admin-userVO";
import {Role} from "@models/role.model";
import { RoleMapping } from "@models/role-mapping.model";
import {v4 as uuidv4} from 'uuid';
import { RoleIds } from '@enums';
import { generateOtp, sendEmail } from '../utils/common.util';
import { genLink } from '../utils/link.util';
import * as Bcrypt from 'bcrypt';

@Service()
class AdminService {
    /**
     * @description
     */


    private static instance: AdminService;
    subUserRepo: Repository<SubUserModel>;
    userRepo: Repository<User>;
    roleRepo: Repository<Role>;

    /**
     * @description
     */
    static get(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }

    getSubUserRepo(){
        if(!this.subUserRepo){
            this.subUserRepo = getRepository(SubUserModel);
        }
        return this.subUserRepo;
    }

    getUserRepo(){
        if(!this.userRepo){
            this.userRepo = getRepository(User);
        }
        return this.userRepo;
    }

    getRoleForAssigneeRepo(){
        if(!this.roleRepo){
            this.roleRepo = getRepository(Role);
        }
        return this.roleRepo;
    }

    async getAllSubUserList(loggedInUserId: number) {

        const userList: SubUserModel[] = await this.getSubUserRepo().find({
            relations: ["user", "user.roleMapping"],
            where: {
                subscriberId:  loggedInUserId
            }
        })
        console.log('length is', userList.length)
        return userList;
    }

    async createSubUser(createUsersVO: CreateSubUsersVO, loggedInUserId: number){
        let counter = 0;
        for (const userVo of createUsersVO.users) {
            counter += 1;
            const user = await this.getSubUserRepo().createQueryBuilder('subUser')
                .where('subUser.email = :email', {email: userVo.email})
                .andWhere('subUser.subscriberId = :subscriberId', { subscriberId: loggedInUserId})
                .getOne();
                console.log("user 1 "+ user);

            if(user){
                // update it
                console.log('updating')
                console.log(counter);
                await this.getSubUserRepo().createQueryBuilder('subUser').update({
                    name: user.name,
                    email: user.email,
                    department: user.department,
                    designation: user.designation,
                    organisation_level: user.organisation_level,
                    verified: user.verified,
                    userId: user.userId,
                    subscriberId: loggedInUserId
                }).where('subUser.id = :id',{id:user.id}).execute();

                const userModel: User[] = await this.getUserRepo().createQueryBuilder('user')
                    .where('user.email  = :email',  { email:  user.email})
                    .execute();
                if(userModel && userModel.length > 0){
                    user.userId = userModel[0]['user_id'];
                    await this.getSubUserRepo().save(user);
                } else {
                    const name = (userVo !== undefined && userVo !== null) ? userVo.name : '';
                    const randomPassword = genLink(8);
                    console.log('randomPassword :', randomPassword);
                    const data = new User({
                        name: user.name,
                        username: uuidv4(),
                        email: user.email,
                        roleId: RoleIds.undecided,
                        otp: generateOtp(),
                        fullname: name,
                        password: randomPassword,
                        social_type: ''
                    });

                    const savedUser = await getRepository(User).save(data);
                    user.userId = savedUser.id;
                    await this.getSubUserRepo().save(user);
                }
            } else {
                console.log('creating', counter)
                const newUser = await this.getSubUserRepo().save({
                    email: userVo.email,
                    name: userVo.name,
                    designation: createUsersVO.designation,
                    department: createUsersVO.department,
                    organisation_level: createUsersVO.organisation_level,
                    subscriberId: loggedInUserId
                });
                console.log('newUser', newUser)
                const userModel: User[] = await this.getUserRepo().createQueryBuilder('user')
                    .where('user.email  = :email',  { email:  newUser.email})
                    .execute();

                const getSubscriberData = await this.getUserRepo().findOne({
                    where: {
                        id: newUser.subscriberId
                    }
                })
                const randomPassword = genLink(8);
                const emailStr = userModel && userModel.length > 0 ? '' : `Please use this temporary password to login : ${randomPassword}`;
                if(getSubscriberData){
                    const mailContent = `Hello ${newUser.name}, You have been added by ${getSubscriberData.fullname}, as a user in Viliyo Application. ${emailStr}`;
                    await sendEmail(newUser.email, mailContent);
                }

                if(userModel && userModel.length > 0){
                    newUser.userId = userModel[0]['user_id'];
                    await this.getSubUserRepo().save(newUser);
                } else {

                    console.log('randomPassword :', randomPassword);
                    const data = new User({
                        name: newUser.name,
                        username: uuidv4(),
                        email: newUser.email,
                        roleId: RoleIds.undecided,
                        otp: generateOtp(),
                        fullname: newUser ? newUser.name: '',
                        password: randomPassword,
                        social_type: ''
                    });

                    const savedUser = await this.getUserRepo().save(data);
                    console.log(savedUser);
                    newUser.userId = savedUser.id;
                    await this.getSubUserRepo().save(newUser);
                }
            }
        }

        return {};
    }

    async getRoleListForAssigningToUser() {
        return await this.getRoleForAssigneeRepo().find();
    }

    async deleteUser(deleteUserVO: DeleteSubUserVO) {
        try {
            const user = await getRepository(SubUserModel).findOne({
                where: {
                    id: deleteUserVO.id
                }
            })

            const roleMapping = await getRepository(RoleMapping).findOne({
                where:{
                    userId:user.userId
                }
            });
            await getRepository(RoleMapping).remove(roleMapping);

            return await getRepository(SubUserModel).remove(user);



        } catch (err) {
            console.log('err', err);
        }
    }

    async assignRolesToSubUser(assignRoleVO:AssignRoleVO) {
        try {
            const rolesToAssignList = [];
            assignRoleVO.userId.forEach(userIds => {
                const assignRole = {
                    userId: userIds,
                    roleId: assignRoleVO.roleId
                };
                rolesToAssignList.push(assignRole);
            })


            const saveToRoleMapping = await getRepository(RoleMapping).createQueryBuilder('roleMap')
            .insert()
            .into(RoleMapping)
            .values(rolesToAssignList)
            .execute();

            console.log('saveToRoleMapping :', saveToRoleMapping)

            // const getAssignedRole = await getRepository(RoleMapping).findOne({
            //     where: {
            //         userId: userIds,

            //     }
            // })

            return rolesToAssignList;
        } catch (err) {
            console.log('err', err);
        }
    }

    async updateUser(updateSubUserVO: UpdateSubUserVO, loggedInUserId: number) {
        try {
            const user = await getRepository(SubUserModel).findOne({
                where: {
                    id: updateSubUserVO.id
                }
            })
            console.log('user :', user);
            if(user) {
                const updateObj = {
                    name: updateSubUserVO.name,
                    email: updateSubUserVO.email,
                    department: updateSubUserVO.department,
                    designation: updateSubUserVO.designation,
                    organisation_level: updateSubUserVO.organisation_level,
                    verified: updateSubUserVO.verified
                }
                await this.getSubUserRepo().update(user.id, updateObj)
            }
        } catch (err) {
            console.log('err', err);
        }
    }
}


const traineeService = AdminService.get();

export { traineeService as AdminService };
