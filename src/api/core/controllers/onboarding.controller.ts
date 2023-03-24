import {success} from "@utils/common.util";
import {Request, Response} from "express";
import {RoleInputVo} from "../types/uiVOs/details-inputVO";
import {getRepository} from "typeorm";
import {RoleMapping} from "@models/role-mapping.model";
import {User} from "@models/user.model";
import {VTTRequestVO} from "../types/uiVOs/VTTRequestVO";

class OnboardingController {
    /**
     * @description
     */
    private static instance: OnboardingController;

    private constructor() { }

    /**
     * @description
     */
    static get(): OnboardingController {
        if (!OnboardingController.instance) {
            OnboardingController.instance = new OnboardingController();
        }
        return OnboardingController.instance;
    }

    /**
     * 1.   Subscriber
     * 2.   Super Admin
     * 3.   Admin
     * 4.   Trainer
     * 5.   Coordinator
     * 6.   Trainee
     * 7.   Anonymous
     */
    async setRoleWithRTClass(req: Omit<VTTRequestVO, 'body'> & { body: RoleInputVo }, res: Response, next: () => void): Promise<void> {
        const input = req.body;
        console.log(input);
        let roleMapping = {  };
        const roleRepo = await getRepository(RoleMapping);
        console.log(req.user);
        switch (input.role_id) {
            case 1:
                // Individual trainer
                roleMapping = {userId: req.user as number, roleId: input.role_id};
                /*
                * Business idea is if individual trainer is on-boarding, assign it as subscriber itself
                * */
                let trainer = await roleRepo.createQueryBuilder('roleMapping')
                    .where('roleMapping.userId =:userId', { userId: req.user })
                    .getOne();
                if(trainer){
                    const user: any = await OnboardingController.instance.getUserRoles(req.user);
                    console.log(user);
                    res.status(200).json(success('User role already exists for userId ', {roleMapping: user.roleMapping}, res.statusCode));
                    return;
                } else {
                    console.log('Creating role mapping');
                    const roles = [{userId: req.user as number, roleId: 1}];// subscriber
                    if(input.individual_trainer){
                        console.log('individual_trainer')
                        roles.push({userId: req.user as number, roleId: 4}); // trainer
                    }
                    await roleRepo.createQueryBuilder('roleMapping').insert()
                        .into(RoleMapping)
                        .values(roles).execute();
                }
                break;
            case 2:
                // Enterprise. Save this as subscriber only.
                let subscriber: RoleMapping = await roleRepo.createQueryBuilder('roleMapping')
                    .where('roleMapping.userId =:userId',{userId: req.user})
                    // SUBSCRIBER value is: 3
                    .andWhere('roleMapping.roleId =:roleId', { roleId: 1 })
                    .getOne();
                if(subscriber){
                    //update it
                    console.log('updating the existing role')
                    roleRepo.save({roleId: subscriber.roleId, id: subscriber.id, userId: subscriber.userId});
                } else {
                    console.log('creating the new role');
                    await roleRepo.save({userId: req.user as number, roleId: 1});
                }
                break;
            case 3:
                // Trainee/Participant
                let trainee: RoleMapping = await roleRepo.createQueryBuilder('roleMapping')
                    .where('roleMapping.userId =:userId',{userId: req.user})
                    // SUBSCRIBER value is: 3
                    .andWhere('roleMapping.roleId =:roleId', { roleId: 6 })
                    .getOne();
                if(trainee){
                    console.log('updating the trainee');
                } else {
                    console.log('creating the trainee role');
                    await roleRepo.save({userId: req.user as number, roleId: 6});
                }
                break;
            default:
                res.status(400).json(success('Invalid role ID', {}, res.statusCode));
        }
        const user: any = await OnboardingController.instance.getUserRoles(req.user);
        if(user != null){
            const payload = {roleMapping: user.roleMapping}
            res.status(200).json(success('Role saved successfully', payload, res.statusCode));
        } else {
            res.status(400).json(success('Something went wrong', { }, res.statusCode))
        }
        res.end();
    }

    async createLiveSessionLink(req: Omit<VTTRequestVO, 'body'> & { body: RoleInputVo }, res: Response, next: () => void): Promise<void>{

    }

    async createInviteLink(req: Omit<VTTRequestVO, 'body'> & { body: RoleInputVo }, res: Response, next: () => void): Promise<void>{

    }

    async getUserRoles(userId) {
        console.log(userId)
        return await getRepository(User).createQueryBuilder('user')
            .where('user.id =:userId',{userId: userId})
            .leftJoinAndSelect('user.roleMapping', 'roleMapping')
            .getOne();
    }
}

const onboardingController = OnboardingController.get();

export {onboardingController as OnboardingController}
