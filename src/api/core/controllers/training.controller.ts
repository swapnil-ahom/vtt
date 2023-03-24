import {InputDetailsVO} from './../types/uiVOs/details-inputVO';
import {Request} from "express";
import {IResponse} from "@interfaces";
import {getRepository, Repository} from "typeorm";
import {success} from "@utils/common.util";
import {BreakOutRoom, BreakOutRoomVO, ParticipantJoinVO, TrainingRoomVO} from "../types/uiVOs/training-roomVO";
import {TrainingRoom} from "@models/training-room.model";
import {TRAINING_ROOM_TYPES} from "@enums/training-room-type.enum";
import {RoomValidationSuite} from "@services/room-validation-suite";
import {Participants} from "@models/participants.model";
import SessionMapping from "@models/session-mapping.model";
import {VTTRequestVO} from "../types/uiVOs/VTTRequestVO";
import {Initiators, PendingTaskActions, PendingTaskActionVO} from "../types/uiVOs/trainee-attendanceVO";
import {Pending_Tasks} from "@models/pendingTasks.model";
import {status_enum} from "@enums/notification.enum";
import {ScheduledTasks} from "@models/scheduled-tasks.model";
import {SCHEDULED_TASKS_TYPE} from "@enums/scheduled-tasks-type.enum";

class TrainingRoomController {

    private static instance: TrainingRoomController;
    private pendingTask: Repository<Pending_Tasks>;
    private scheduledTasks: Repository<ScheduledTasks>;

    static get(): TrainingRoomController {
        if (!TrainingRoomController.instance) {
            TrainingRoomController.instance = new TrainingRoomController();
        }
        return TrainingRoomController.instance;
    }

    public async getPendingTaskRepo() {
        if(!this.pendingTask){
            this.pendingTask = getRepository(Pending_Tasks);
        }
        return this.pendingTask;
    }

    public async getScheduledTaskRepo() {
        if(!this.scheduledTasks){
            this.scheduledTasks = getRepository(ScheduledTasks);
        }
        return this.scheduledTasks;
    }

    public async createTrainingRoom(req: Omit<Request, 'body'> & { body: TrainingRoomVO }, res: IResponse): Promise<void> {
        const tngRoomRepo = getRepository(TrainingRoom);
        const sesMapId = req.body.sessionMapId;
        const sessionMap = await getRepository(SessionMapping).createQueryBuilder('sessionMap')
            .where({id: sesMapId})
            .getOne();
        if (sessionMap) {
            let savedTrainingRoom: TrainingRoom = await tngRoomRepo.findOne({
                where: {
                    sessionMap: sessionMap,
                    parentRoom: null
                }
            });
            if (savedTrainingRoom) {
                // room already exist. Return the room ID
            } else {
                savedTrainingRoom = new TrainingRoom({
                    status: TRAINING_ROOM_TYPES.IN_PROGRESS, sessionMap: sessionMap,
                    participantList: ''
                })
                savedTrainingRoom = await tngRoomRepo.save(savedTrainingRoom);
            }
            res.status(200).json(success('', {room: savedTrainingRoom}, res.statusCode));
        } else {
            res.status(200).json(success('Invalid Session ID supplied', {}, res.statusCode));
        }
        res.end()
    }

    public async validateJoinTrainingRoom(req: Omit<Request, 'body'> & { body: ParticipantJoinVO }, res: IResponse): Promise<void> {
        const tngRoomRepo = getRepository(TrainingRoom);
        const {email, sessionMapId} = req.body;
        const participant = await getRepository(Participants).findOne({
            where: {
                email: email
            }
        });
        if (!participant) {
            res.status(400).json(success('No participant found', {}, res.statusCode));
            res.end();
            return;
        }
        const tRoom = await tngRoomRepo.findOne({
            where: {
                sessionMap: sessionMapId,
                parentRoom: null
            }
        });
        if (tRoom) {
            tRoom.participantList = new RoomValidationSuite().addParticipantToRoom(tRoom.participantList, participant);
        }
        await tngRoomRepo.save(tRoom);
        res.status(200).json(success('', {tRoom}, res.statusCode));
        res.end()
    }

    public async createSubRooms(req: Omit<Request, 'body'> & { body: BreakOutRoomVO }, res: IResponse): Promise<void> {
        const tngRoomRepo = getRepository(TrainingRoom);
        const {roomId, sessionMapId} = req.body;
        const breakOutData: BreakOutRoom[] = req.body.roomParticipants;
        let message = '';
        const savedRoom = await tngRoomRepo.findOne({
            where: {
                id: roomId
            }
        });
        const createdRoom = [];
        if (savedRoom) {
            // Room found. Create break-out rooms
            for (const newRoom of breakOutData) {
                const participantList = new RoomValidationSuite().convertListToCommaSeparated(newRoom.participants);
                let tRoom = new TrainingRoom({
                    participantList: participantList, sessionMap: sessionMapId,
                    status: TRAINING_ROOM_TYPES.IN_PROGRESS, roomJoinLink: '',
                    parentRoom: savedRoom,
                })
                console.log(tRoom);
                tRoom = await tngRoomRepo.save(tRoom);
                createdRoom.push(tRoom);
            }
            message = 'Break-out room created';
        } else {
            message = 'Invalid ID supplied';
        }
        res.status(200).json(success(message, {room: createdRoom}, res.statusCode));
        res.end()
    }

    public async ConsoleDetails(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const sessionMapId = req.body.id;
        try {
            const consoleDetails = await getRepository(SessionMapping).createQueryBuilder('sessionMapping')
                .where('sessionMapping.id = :id', {id: sessionMapId})
                .leftJoinAndSelect('sessionMapping.batch', 'programBatch')
                .leftJoinAndSelect('programBatch.supportTeamList', 'supportTeamList')
                .leftJoinAndSelect('programBatch.participants', 'participants')
                .leftJoinAndSelect('programBatch.sittingStyle', 'sittingStyle')
                .leftJoinAndSelect('sessionMapping.session', 'sessions')
                .leftJoinAndSelect('sessions.program', 'program')
                .getOne();

            res.status(200).json(success('', {consoleDetails}, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end()
    }

    public async updatePendingTaskStatus(req: Omit<VTTRequestVO, 'body'> & { body: PendingTaskActionVO }, res: IResponse): Promise<void> {
        const input = req.body;
        if(!input.id){
            res.status(400).json(success('Pending task ID is required', {id: input.id}, res.statusCode));
            return ;
        }
        const pTask = await (await TrainingRoomController.instance.getPendingTaskRepo()).findOne({
            where: {
                id: input.id
            }
        });
        if(!pTask){
            res.status(400).json(success(`No pending task found with ID ${input.id}`, {id: input.id}, res.statusCode));
            return ;
        }
        if(input.initiator === Initiators.trainer || input.initiator === Initiators.trainee ||
            input.initiator === Initiators.admin){
            // This is trainer trying to mark pending task
            if(input.action === PendingTaskActions.read){
                // mark is as read
                pTask.status = status_enum.read;
                pTask.is_pending = true
                await (await TrainingRoomController.instance.getPendingTaskRepo()).save(pTask);
            } else if(input.action === PendingTaskActions.reminder){
                // set a reminder and delete/deactivate the pending task
                pTask.status = status_enum.read;
                pTask.is_pending = false
                const data = {
                    id: input.id, type: input.action
                }
                await (await TrainingRoomController.instance.getPendingTaskRepo()).save(pTask);
                await (await TrainingRoomController.instance.getScheduledTaskRepo()).save({
                        cron_expression: '0 15 10 15 * ?', data: JSON.stringify(data), status: SCHEDULED_TASKS_TYPE.SCHEDULED
                })
            } else if(input.action === PendingTaskActions.delete){
                // mark is as delete
                pTask.status = status_enum.read;
                pTask.is_pending = false
                await (await TrainingRoomController.instance.getPendingTaskRepo()).save(pTask);
            }
        }
        res.status(200).json(success('Pending task status updated', {id: input.id}, res.statusCode));
    }
}


const trainingRoomController = TrainingRoomController.get();

export {trainingRoomController as TrainingRoomController}

