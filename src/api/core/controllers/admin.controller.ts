import {Request, Response} from 'express';
import {RoleInputVo} from '../types/uiVOs/details-inputVO';
import {VTTRequestVO} from '../types/uiVOs/VTTRequestVO';
import {AssignRoleVO, CreateSubUsersVO, CreateUserVO, DeleteSubUserVO, UpdateSubUserVO} from '../types/uiVOs/admin-userVO';
import {AdminService} from '@services/admin.service';
import {success} from '@utils/common.util';
import {getRepository, Repository, getManager} from 'typeorm';
import {RoleMapping} from '@models/role-mapping.model';
import { Pending_Tasks } from '@models/pendingTasks.model';
import {Programs} from '@models/programs.model';
import {Session} from 'inspector';
import Sessions from '@models/sessions.model';
import {Participants} from '@models/participants.model';
import {SubUserModel} from '@models/sub-user.model';

class AdminController {
    /**
     * @description
     */
    private static instance: AdminController;

    private roleMapRepo: Repository<RoleMapping>;

    private constructor() { }

    /**
     * @description
     */
    static get(): AdminController {
        if (!AdminController.instance) {
            AdminController.instance = new AdminController();
        }
        return AdminController.instance;
    }

    getRoleMappingRepo(){
        if(!this.roleMapRepo){
            this.roleMapRepo = getRepository(RoleMapping);
        }
        return this.roleMapRepo;
    }

    async getAllSubUserListForAdmin(req: Omit<VTTRequestVO, 'body'> & { body: RoleInputVo }, res: Response, next: () => void): Promise<void> {
        console.log(req.user, 'membership')
        const userList = await AdminService.getAllSubUserList(req.user);
        res.status(200).json(success('true', {userList }, 201));
        res.end()
    }

    async createSubUser(req: Omit<VTTRequestVO, 'body'> & { body: CreateSubUsersVO }, res: Response, next: () => void): Promise<void>{
        try{
            const user = await AdminService.createSubUser(req.body, req.user);
            res.status(200).json(success('true', { user }, 201));
            res.end()
        } catch (e) {
            console.log(e)
            res.status(400).json(success('false', e.message , 400));
            res.end()
        }
    }

    async getRoleListForAssign(req: Omit<VTTRequestVO, 'body'> & { body: CreateSubUsersVO }, res: Response, next: () => void): Promise<void>{
        const roleList = await AdminService.getRoleListForAssigningToUser();
        res.status(200).json(success(true, { roleList }, 200));
        res.end()
    }

    async assignRolesToSubUser(req: Omit<VTTRequestVO, 'body'> & { body: AssignRoleVO }, res: Response, next: () => void): Promise<void>{
        const user = await AdminService.assignRolesToSubUser(req.body);
        res.status(200).json(success(true, { user }, 200));
        res.end()
    }

    async deleteUser(req: Omit<VTTRequestVO, 'body'> & { body: DeleteSubUserVO }, res: Response, next: () => void): Promise<void>{
        const user = await AdminService.deleteUser(req.body);
        res.status(200).json(success(true, { user }, 200));
        res.end()
    }

    async getAdminDashboardData(req: Omit<VTTRequestVO, 'body'> & { body: AssignRoleVO }, res: Response, next: () => void): Promise<void>{
        await getManager().query(
            'SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,\'ONLY_FULL_GROUP_BY\',\'\'))'
          );
        const dashboard = {
            userSummary: {
                subscriberCount: 0,
                superAdminCount: 0,
                adminCount: 0,
                coordinatorCount: 0,
                trainerCount: 0,
            },
            programSummary: {
                noOfProgram: 0,
                noOfSessions: 0,
                noOfParticipants: 0,
                engagementScore: 0,
                averageRating: 0
            },
            pendingTasks: [

            ]
        }
        dashboard.pendingTasks = await getRepository(Pending_Tasks).find({
            where: {
                pertain_to: req.user,
                is_pending: true
            }
        });
        const noOfProgram = await getRepository(Programs).count({
            where:{
                subscriber_id: req.user
            }
        });
        const sessionList: Sessions[] = await getRepository(Sessions).createQueryBuilder('session')
            .where('session.subscriber_id = :subscriberId', { subscriberId: req.user })
            .leftJoinAndSelect('session.program','program')
            .getMany();
            // .execute()
        let sessionCount: number;
        if(sessionList){
            sessionCount = sessionList.length
        } else {
            sessionCount = 0
        }
        let programListStr = '';
        try{
            sessionList.forEach((session, index) => {
                if(session.program){
                    console.log('session.program.id', session.program.id)
                    if(index === 0){
                        programListStr += session.program.id
                    }else if(programListStr.includes(`${session.program.id}`)){

                    }else {
                        programListStr = programListStr.concat(',').concat(session.program.id.toString());
                    }
                }
            })
        }catch(err){
            console.log(err);
        }
        let participantCount = 0;
        if(programListStr.length > 0){
            participantCount = await getRepository(Participants).createQueryBuilder('participants')
            .where(`participants.programId IN (${programListStr})`)
            .getCount();
            console.log('participantCount', participantCount);
        }
        dashboard.programSummary = {
            noOfProgram,
            noOfSessions: sessionCount,
            noOfParticipants: participantCount,
            engagementScore: 0,
            averageRating: 0 }

        // logic for userSummary :

        const allSubUserInfo = await getRepository(SubUserModel)
            .createQueryBuilder('subUser')
            .where('subUser.subscriberId = :id',{id : req.user})
            .getMany();

        for (let i = 0; i < allSubUserInfo.length; i++) {
            const subUserItem :any = allSubUserInfo[i];
            const allRolesInfo = await getRepository(RoleMapping)
                .createQueryBuilder('role')
                .where('role.userId = :id',{id : subUserItem.userId})
                .groupBy('role.roleId')
                .getMany();
            allRolesInfo.forEach(item => {
                if(item.roleId == 1) dashboard.userSummary.subscriberCount++;
                else if(item.roleId === 2) dashboard.userSummary.superAdminCount++;
                else if(item.roleId === 3) dashboard.userSummary.adminCount++;
                else if(item.roleId === 4) dashboard.userSummary.trainerCount++;
                else if(item.roleId === 5) dashboard.userSummary.coordinatorCount++;
            });
        }

        res.status(200).json(success(true, { dashboard }, 200));
        res.end()
    }

    async updateUser(req: Omit<VTTRequestVO, 'body'> & { body: UpdateSubUserVO }, res: Response, next: () => void): Promise<void>{
        try{
            const user = await AdminService.updateUser(req.body, req.user);
            res.status(200).json(success('true', { user }, 201));
            res.end()
        } catch (e) {
            console.log(e)
            res.status(400).json(success('false', {  }, 400));
            res.end()
        }
    }

    async getPendingTask(req: Request, res: Response): Promise<void>{
        try {
            const userType = req.params.user_type
            const pendingTasksInfo = await getRepository(Pending_Tasks).createQueryBuilder('pendingTask')
                .where('pendingTask.user_type = :user_type', {user_type: userType})
                .andWhere('pendingTask.pertain_to =:pertain_to',{pertain_to:req.user})
                .andWhere('pendingTask.is_pending = \'true\'')
                .getMany();

            res.status(200).json(success('', { pendingTasksInfo }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }
}

const adminController = AdminController.get();

export {adminController as AdminController}
