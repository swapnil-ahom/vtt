
import { Request, response } from 'express';
import { IResponse, IRequest, ITraineeTokenOptions } from '@interfaces';
import { getRepository, Brackets, getCustomRepository, getTreeRepository, Index } from 'typeorm';
import { success, error } from '@utils/common.util';
const dayjs = require("dayjs");
import { Library } from '@models/libary.model';
import { LibrarySegment } from '@models/library-segment.model';
import { SESSION_PLAN_STATUS } from '../types/enums/session-plan-status.enum';
import { LibraryActivity } from '@models/library-activity.model';
import { LibraryActivityVo } from '../types/uiVOs/libraryActivityVo';
import { InputDetailsVO } from '../types/uiVOs/details-inputVO';
import SessionMapping from '@models/session-mapping.model';
import { SeatingStyle } from '@models/seating-style.model';
import { SegmentListVO } from '../types/uiVOs/segment-listVO';
import { SEGMENT_TYPE_ENUMS } from '@enums';
import { SessionSegment } from '@models/session_segment.model';
import { SegmentActivity } from '@models/segment_activity.model';
import { GetLibraryVO, GetLibraryByTypeVO, GetLibraryByIdVO, CreateLibraryVO, ShareLibraryVO, DeleteLibraryVO, LibraryDocumentVO, IndependentSessionVO, IndependentLibrayActivityVO } from '../types/uiVOs/libraryVO'
import {VTTRequestVO} from '../types/uiVOs/VTTRequestVO';
import { LIBRARY_ENUM } from '../types/enums/library.enum';
import { DateUtil } from '../utils/date.util';
import { LIBRARY_TYPE_ENUM } from '../types/enums/libary-type.enum';

class IndependentSessionnController {

    private static instance: IndependentSessionnController;

    static get(): IndependentSessionnController {
        if (!IndependentSessionnController.instance) {
            IndependentSessionnController.instance = new IndependentSessionnController();
        }
        return IndependentSessionnController.instance;
    }


    async copyTemplate(req: Request, res: IResponse): Promise<void> {
        try { 
            // let libraryActivity;
            let Nsessionsegment =[];
            let NsegmentActivity =[];
            const librarySegment = await getRepository(LibrarySegment).createQueryBuilder('Lsegment')
            .where('Lsegment.library =:library',{library:req.body.library_id})
            .getMany();
            for(let i=0; i<librarySegment.length; i++){
                    const  libraryActivity = await getRepository(LibraryActivity).createQueryBuilder('LActivity')
                    .where('LActivity.librarySegment =:librarySegment',{librarySegment:librarySegment[i].id})
                    .getMany();

                if(librarySegment.length != 0 ){
                    const session = await getRepository(SessionSegment);
                    const _sessions: SessionSegment = new SessionSegment({
                        title: librarySegment[i].title,
                        description: librarySegment[i].description,
                        duration: librarySegment[i].duration,
                        start_time: librarySegment[i].start_time,
                        end_time: librarySegment[i].end_time,
                        type:librarySegment[i].type,
                        session_plan_status:librarySegment[i].library_plan_status,
                        session: req.body.session_id,
                        media_attachment_ids: librarySegment[i].media_attachment_ids,
                        media_attachment: librarySegment[i].media_attachment,
                        is_deleted: librarySegment[i].is_deleted,
                        activity_type: librarySegment[i].activity_type,
                        activity_data:librarySegment[i].activity_data,
                    });
                    var _Sessions: SessionSegment = await session.save(_sessions);
                    Nsessionsegment.push(_Sessions);

                    for(let j=0; j<libraryActivity.length; j++){
                        const segmetnactivity = await getRepository(SegmentActivity) 
                        const _SActivity: SegmentActivity = new SegmentActivity({
                            sessionSegment:_Sessions.id,
                            activityType:libraryActivity[j].activityType,
                            activity_id:libraryActivity[j].activity_id,
                            activity_name:libraryActivity[j].activity_name,
                            activity_data:libraryActivity[j].activity_data,
                            activity_submission_date:libraryActivity[j].activity_submission_date,
                            activate_before_days:libraryActivity[j].activate_before_days,
                            media_attachment_ids:libraryActivity[j].media_attachment_ids,
                            media_attachment:libraryActivity[j].media_attachment,
                            is_deleted:libraryActivity[j].is_deleted
                        });
                        const _sactivity: SegmentActivity = await segmetnactivity.save(_SActivity)
                        NsegmentActivity.push(_sactivity);
                    }
                }
            }
            res.status(200).json(success('', {Nsessionsegment,NsegmentActivity}, res.statusCode));

        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }

    public async librarySegment(req: Omit<Request, 'body'> & { body: LibrarySegment }, res: IResponse): Promise<void> {

        const librarysegmentRepo = getRepository(LibrarySegment);
        const inputlibrarysegment = req.body;
        try {
            const librarySegment = await librarysegmentRepo.createQueryBuilder('librarysegment')
                .where('librarysegment.id =:id', { id: req.body.id })
                .getOne();

            if (librarySegment && librarySegment.is_deleted) {
                res.status(200).json(success(`Segment with id ${req.body.id} is deleted`, {}, res.statusCode));
            } else if (inputlibrarysegment.id === null || inputlibrarysegment.id === 0) {
                const segments = await librarysegmentRepo.createQueryBuilder('segment')
                    .select('COUNT(*)', 'count')
                    .where('segment.libraryid = :libraryid', { libraryid: inputlibrarysegment.library })
                    .andWhere('segment.type = :type', { type: inputlibrarysegment.type })
                    .andWhere('segment.library_plan_status = :status', { status: SESSION_PLAN_STATUS.COMPLETED })
                    .getRawOne();

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (segments.count > 0)
                    inputlibrarysegment.library_plan_status = SESSION_PLAN_STATUS.COMPLETED;
                else
                    inputlibrarysegment.library_plan_status = SESSION_PLAN_STATUS.PENDING;

                const sessionSegment: LibrarySegment = await librarysegmentRepo.save(inputlibrarysegment);

                // await getRepository(Library).createQueryBuilder()
                //     .update(Library)
                //     .set({ last_updated_at: Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') })
                //     .where({ id: sessionSegment.library })
                //     .execute();

                res.status(200).json(success('', { librarySegment: inputlibrarysegment }, res.statusCode));
            } else {
                const librarySegment: LibrarySegment = inputlibrarysegment;
                await librarysegmentRepo.createQueryBuilder()
                    .update(LibrarySegment)
                    .set({ ...librarySegment })
                    .where('id = :id', { id: inputlibrarysegment.id })
                    .execute();

                // await getRepository(Library).createQueryBuilder()
                //     .update(Library)
                //     .set({ last_updated_at: Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') })
                //     .where({ id: librarySegment.session })
                //     .execute();

                res.status(200).json(success('', { librarySegment }, res.statusCode));
            }
        } catch (e) {
            res.status(400).json(error(`catched error : ${e}`, res.statusCode));
        } finally {
            res.end();
        }
    }


    public async LibraryActivity(req: Omit<Request, 'body'> & { body: LibraryActivityVo }, res: IResponse): Promise<void> {
        try {
            const libraryActivityRepo = getRepository(LibraryActivity);
            const inputSegmentActivity = req.body;
            const libsegment = await getRepository(LibrarySegment).createQueryBuilder('libregment')
                .where({
                    id: inputSegmentActivity.librarySegmentId,
                    is_deleted: 0
                }).leftJoinAndSelect('libregment.library', 'library')
                .getOne();

            if (!libsegment) {
                res.status(200).json(success(`Session Segment with id ${inputSegmentActivity.librarySegmentId} not found`, {}, res.statusCode));
                return;
            } else {
                inputSegmentActivity.librarySegment = libsegment;
            }

            let libraryActivity = {
                id: inputSegmentActivity.id,
                activity_id: inputSegmentActivity.activity_id,
                activity_data: inputSegmentActivity.activity_data,
                activity_submission_date: inputSegmentActivity.activity_submission_date,
                activate_before_days: inputSegmentActivity.activate_before_days,
                activity_name: inputSegmentActivity.activity_name,
                activityType: inputSegmentActivity.activityType,
                media_attachment: inputSegmentActivity.media_attachment,
                media_attachment_ids: inputSegmentActivity.media_attachment_ids,
                is_deleted: inputSegmentActivity.is_deleted,
                librarySegment: inputSegmentActivity.librarySegment
            }
            if (libraryActivity.id === null || libraryActivity.id === 0) {
                libraryActivity = await libraryActivityRepo.save(libraryActivity);

                res.status(200).json(success('', { libraryActivity }, res.statusCode));
            } else {
                await libraryActivityRepo.createQueryBuilder()
                    .update(LibraryActivity)
                    .set({ ...libraryActivity })
                    .where('id = :id', { id: libraryActivity.id })
                    .execute();

                res.status(200).json(success('', { libraryActivity }, res.statusCode));
            }
        } catch (e) {
            res.status(400).json(error(`Got error : ${e}`, res.statusCode));
        } finally {
            res.end();
        }
    }


    public async getLibraryTypeData(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {

        const librarySegment = await getRepository(LibrarySegment).createQueryBuilder('librarySegment')
            .where('librarySegment.libraryId =:id', { id: req.body.id })
            .andWhere(new Brackets(ab => {
                ab.where('librarySegment.type = :type', { type: req.body.type })
                    .andWhere('is_deleted = 0')
            })).getMany();
        console.log(librarySegment);
        console.log(...librarySegment);


        let librarysegmentlist = []
        for (let i = 0; i < librarySegment.length; i++) {
            const _libraryActivity = await getRepository(LibraryActivity).createQueryBuilder('libraryAtivity')
                .where('libraryAtivity.librarySegmentId =:id', { id: librarySegment[i].id })
                .andWhere('libraryAtivity.is_deleted = 0')
                .getMany();
            librarysegmentlist.push({
                ...librarySegment[i],
                'subSegmentList': _libraryActivity,
            });
        }
        console.log(librarysegmentlist);

        res.status(200).json(success('', { librarysegmentlist }, res.statusCode));
    }

    
    public async deleteLibraryActivity(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        try {
            await getRepository(LibraryActivity).createQueryBuilder()
                .update(LibraryActivity)
                .set({ 'is_deleted': true })
                .where('id = :id', { id: req.body.id })
                .execute();
            res.status(200).json(success('', {}, res.statusCode));
        } catch (e) {
            res.status(400).json(error('', res.statusCode));
        }
    }

    
    public async deleteLibrarySegment(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const librarysegmentrepo = await getRepository(LibrarySegment);
        const libraryctivityrepo = await getRepository(LibraryActivity);
        try {
            const c = await librarysegmentrepo.createQueryBuilder()
                .update(LibrarySegment)
                .set({ 'is_deleted': true })
                .where('id = :id', { id: req.body.id })
                .execute();
            if (c.raw > 0) {
                await libraryctivityrepo.createQueryBuilder()
                    .update(LibrarySegment)
                    .set({ 'is_deleted': true })
                    .where('librarySegmentId = :id', { id: req.body.id })
                    .execute();
            }
            res.status(200).json(success('', {}, res.statusCode));
        } catch (e) {
            res.status(400).json(error('', res.statusCode));
        }
    }

    public async getSegmentListByLibraryID(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const segmentRepo = getRepository(LibrarySegment);
        const libraryrepo = getRepository(Library);
        const sessionmappingRepo = getRepository(SessionMapping);
        const _seatingStyle = await getRepository(SeatingStyle);
        const sortedSegmentDetails: SegmentListVO = { Pre: [], Post: [], Live: [] } as SegmentListVO;
        const library = await libraryrepo.createQueryBuilder('library')
            .where('id = :id', { id: req.body.id })
            .getOne();
        const segmentList: any[] = await segmentRepo
            .createQueryBuilder('segment')
            .where('segment.libraryId = :libraryId', { libraryId: req.body.id })
            .andWhere('segment.is_deleted = 0')
            // .leftJoinAndSelect('segment.replies', 'replies')
            .getMany();
        segmentList.forEach(segment => {
            if (segment.type === SEGMENT_TYPE_ENUMS.PRE) {
                sortedSegmentDetails.Pre.push(segment);
            } else if (segment.type === SEGMENT_TYPE_ENUMS.POST) {
                sortedSegmentDetails.Post.push(segment);
            } else if (segment.type === SEGMENT_TYPE_ENUMS.LIVE) {
                sortedSegmentDetails.Live.push(segment);
            } else {
                console.log('Found invalid library type')
            }
        });
        //Session Mapping
        const _batches = await sessionmappingRepo.createQueryBuilder('mapping')
            .where('mapping.sessionId = :sessionId', { sessionId: req.body.id })
            .leftJoinAndSelect('mapping.trainer', 'trainer')
            .getMany();
        let Seating = {};
        let seatingStyle;
        let batches = []
        for (let i = 0; i < _batches.length; i++) {
            if (_batches[i].batchId != null) {
                seatingStyle = await _seatingStyle.createQueryBuilder('seating')
                    .where('seating.batchId = :batchId', { batchId: _batches[i].batchId })
                    .getOne();
                batches.push(Object.assign({ seatingStyle }, _batches[i]))

            }
        }
        for (let a = 0; a < batches.length; a++) {
            if (!batches[a].seatingStyle) {
                batches[a].seatingStyle = null;
            }
        }
        sortedSegmentDetails.library = library;
        // sortedSegmentDetails.batches = batches ? batches : null;
        sortedSegmentDetails.batches = batches ? batches : null;

        res.status(200).json(success('', { sortedSegmentDetails }, res.statusCode));
        res.end()
    }

    // public async getAllLibrary(req: Omit<VTTRequestVO, 'body'> & { body: GetLibraryVO }, res: IResponse): Promise<void> {
    //     try {
    //         if(req.body.libraryType === LIBRARY_ENUM.MY_LIBRARY) {
    //            var library = await getRepository(Library).find({
    //             where: {
    //                 trainerId: req.user
    //             }
    //            })
    //            res.status(200).json(success('', {library}, res.statusCode));
    //            return;
    //         }
    //         if (req.body.libraryType === LIBRARY_ENUM.SUBSCRIBERS_LIBRARY) {
    //             var library = await getRepository(Library).find({
    //                 where: {
    //                     trainerId: req.user,
    //                     subscriberLibrary: true
    //                 }
    //             })
    //             res.status(200).json(success('', {library}, res.statusCode));
    //             return;
    //         }
    //         if (req.body.libraryType === LIBRARY_ENUM.VILIYO_LIBRARY) {
    //             var library = await getRepository(Library).find({
    //                 where: {
    //                     trainerId: req.user,
    //                     viliyoLibrary: true
    //                 }
    //             })
    //             res.status(200).json(success('', {library}, res.statusCode));
    //             return
    //         }
    //     } catch (err) {
    //         res.status(400).json(success(err.message, {}, res.statusCode));
    //     }
    // }

    // public async getLibraryByType(req: Omit<VTTRequestVO, 'body'> & { body: GetLibraryByTypeVO }, res: IResponse): Promise<void> {
    //     try {
    //         const library = await getRepository(Library).find({
    //             where: {
    //                 trainerId: req.user,
    //                 type: req.body.type,
    //                 libraryType: req.body.libraryType
    //             }
    //         })

    //         res.status(200).json(success('', {library}, res.statusCode));
    //     } catch (err) {
    //         res.status(400).json(success(err.message, {}, res.statusCode));
    //     }
    // }

    // public async getLibraryByType(req: Omit<VTTRequestVO, 'body'> & { body: GetLibraryByTypeVO }, res: IResponse): Promise<void> {
    //     try {

    //         const getMyLibrary = async( trainerId, type )=>{
    //             const library = await getRepository(Library).find({
    //                 where: {
    //                     trainerId: trainerId,
    //                     type: type
    //                 }
    //             })
    //             return library;
    //         }

    //         const getSubscriberLibrary = async( trainerId, type )=>{
    //         const library = await getRepository(Library).find({
    //             where: {
    //                 trainerId: trainerId,
    //                 type: type,
    //                 subscriberLibrary:true
    //             }
    //         })
    //         return library;
    //       }

    //       const getViliyoLibrary = async( trainerId, type )=>{
    //         const library = await getRepository(Library).find({
    //             where: {
    //                 trainerId: trainerId,
    //                 type: type,
    //                 viliyoLibrary:true
    //             }
    //         })
    //         return library;
    //       }

    //       if( req.body.type == LIBRARY_TYPE_ENUM.SESSION_PLAN )
    //       {
    //         if( req.body.libraryType == LIBRARY_ENUM.MY_LIBRARY ){
    //             const library = await getMyLibrary(req.user,req.body.type)
    //             res.status(200).json(success('', {library}, res.statusCode));
    //             return
    //         }

    //         if( req.body.libraryType == LIBRARY_ENUM.SUBSCRIBERS_LIBRARY ){
    //             const library = await getSubscriberLibrary(req.user,req.body.type)
    //             res.status(200).json(success('', {library}, res.statusCode));
    //             return
    //         }

    //         if( req.body.libraryType == LIBRARY_ENUM.VILIYO_LIBRARY ){ 
    //             const library = await getViliyoLibrary(req.user,req.body.type)
    //             res.status(200).json(success('', {library}, res.statusCode));
    //             return
    //         }
    //       }
          
    //       if( req.body.type == LIBRARY_TYPE_ENUM.ROLE_PLAY )
    //       {
    //         if( req.body.libraryType == LIBRARY_ENUM.MY_LIBRARY ){
    //             const library = await getMyLibrary(req.user,req.body.type)
    //             res.status(200).json(success('', {library}, res.statusCode));
    //             return
    //         }

    //         if( req.body.libraryType == LIBRARY_ENUM.SUBSCRIBERS_LIBRARY ){
    //             const library = await getSubscriberLibrary(req.user,req.body.type)
    //             res.status(200).json(success('', {library}, res.statusCode));
    //             return
    //         }

    //         if( req.body.libraryType == LIBRARY_ENUM.VILIYO_LIBRARY ){ 
    //             const library = await getViliyoLibrary(req.user,req.body.type)
    //             res.status(200).json(success('', {library}, res.statusCode));
    //             return
    //         }
    //       }
    //     } catch (err) {
    //         res.status(400).json(success(err.message, {}, res.statusCode));
    //     }
    // }

    // public async getLibraryById(req: Omit<VTTRequestVO, 'body'> & { body: GetLibraryByIdVO }, res: IResponse): Promise<void> {
    //     try {
    //         const library = await getRepository(Library).findOne({
    //             where: {
    //                 id: req.body.id,
    //                 trainerId: req.user
    //             }
    //         })

    //         res.status(200).json(success('', {library}, res.statusCode));
    //     } catch (err) {
    //         res.status(400).json(success(err.message, {}, res.statusCode));
    //     }
    // }

    // public async createLibrary(req: Omit<VTTRequestVO, 'body'> & { body: CreateLibraryVO }, res: IResponse): Promise<void> {
    //     try {
    //         if(req.body.type === LIBRARY_TYPE_ENUM.SESSION_PLAN) {
    //             const library = new Library({
    //                 content_name: req.body.name,
    //                 type: LIBRARY_TYPE_ENUM.SESSION_PLAN,
    //                 tags: req.body.tags,
    //                 duration: req.body.duration,
    //                 mediaType: req.body.mediaType,
    //                 mediaUrl: req.body.mediaUrl,
    //                 libraryType: LIBRARY_ENUM.MY_LIBRARY,
    //                 imageUrl: req.body.imageUrl,
    //                 trainerId: req.user,
    //                 description: req.body.description,
    //                 subscriberLibrary: req.body.subscriberLibrary,
    //                 viliyoLibrary: req.body.viliyoLibrary,
    //                 title: req.body.title
    //             })
    
    //             const sessionPlanLibrary = await getRepository(Library).save(library)
    //             res.status(200).json(success('Session Plan Created', {sessionPlanLibrary}, res.statusCode));
    //             return;
    //         }
    //         if(req.body.type === LIBRARY_TYPE_ENUM.ROLE_PLAY) {
    //             const library = new Library({
    //                 content_name: req.body.name,
    //                 type: LIBRARY_TYPE_ENUM.ROLE_PLAY,
    //                 tags: req.body.tags,
    //                 duration: req.body.duration,
    //                 mediaType: req.body.mediaType,
    //                 mediaUrl: req.body.mediaUrl,
    //                 libraryType: LIBRARY_ENUM.MY_LIBRARY,
    //                 imageUrl: req.body.imageUrl,
    //                 trainerId: req.user,
    //                 description: req.body.description,
    //                 subscriberLibrary: req.body.subscriberLibrary,
    //                 viliyoLibrary: req.body.viliyoLibrary,
    //                 title: req.body.title
    //             })
    
    //             const rolePlayLibrary = await getRepository(Library).save(library)
    //             res.status(200).json(success('Role Play Created', {rolePlayLibrary}, res.statusCode));
    //             return;
    //         }
    //     } catch (err) {
    //         res.status(400).json(success(err.message, {}, res.statusCode));
    //     }
    // }

    public async shareLibrary(
        req: Omit<VTTRequestVO, "body"> & { body: ShareLibraryVO },
        res: IResponse
      ): Promise<void> {
        try {
    
          const library = await getRepository(LibrarySegment).findOne({
            where: {
              id: req.body.id,
            }
          });

          if (req.body.libraryType === LIBRARY_ENUM.SUBSCRIBERS_LIBRARY && library.subscriberLibrary == false) {
            const libaray = await getRepository(LibrarySegment)
              .createQueryBuilder()
              .update(LibrarySegment)
              .set({ subscriberLibrary: true })
              .where("id = :id", { id: req.body.id })
              .execute();
            res
              .status(200)
              .json(success("Your library is shared", {}, res.statusCode));
            return;
          }
          if (req.body.libraryType === LIBRARY_ENUM.VILIYO_LIBRARY&&library.viliyoLibrary==false) {
            await getRepository(LibrarySegment)
              .createQueryBuilder()
              .update(LibrarySegment)
              .set({ viliyoLibrary: true })
              .where("id = :id", { id: req.body.id })
              .execute();
            res
              .status(200)
              .json(success("Your library is shared", {}, res.statusCode));
            return;
          }

          res
            .status(200)
            .json(success("Your library is already shared", {}, res.statusCode));
        } catch (err) {
          res.status(400).json(error(err.message, res.statusCode));
        }
      }

    public async deleteLibrary(req: Omit<VTTRequestVO, 'body'> & { body: DeleteLibraryVO }, res: IResponse): Promise<void> {
        try {
            const library = await getRepository(LibrarySegment).findOne({
                where: {
                    id: req.body.id
                }
            })

            await getRepository(LibrarySegment).remove(library)

            res.status(200).json(success('Deleted Successfully', {}, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    public async uploadLibraryDocument(req: Omit<VTTRequestVO, 'body'> & { body: LibraryDocumentVO }, res: IResponse): Promise<void> {
        try {
            const document = new LibrarySegment({
                mediaType: req.body.mediaType,
                mediaUrl: req.body.mediaUrl,
                libraryType: LIBRARY_ENUM.MY_LIBRARY,
                trainerId: req.user,
                subscriberLibrary: req.body.subscriberLibrary,
                viliyoLibrary: req.body.viliyoLibrary,
                description: req.body.description
            })

            const mediaLibrary = await getRepository(LibrarySegment).save(document)


            res.status(200).json(success('Document Uploaded', {mediaLibrary}, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async createLibraryIndependentSession(req: Omit<Request, 'body'> & { body: IndependentSessionVO }, res: IResponse): Promise<void> {

        const librarysegmentRepo = getRepository(LibrarySegment);
        const inputlibrarysegment = new LibrarySegment({
            id: req.body.id,
            title: req.body.title,
            description: req.body.description,
            duration: req.body.duration,
            start_time: req.body.startTime,
            end_time: req.body.endTime,
            type: req.body.type,
            media_attachment: req.body.mediaAttachment,
            media_attachment_ids: req.body.mediaAttachmentIds,
            library: req.body.library,
            trainerId: req.user,
            activity_type: req.body.activityType,
            libraryType: LIBRARY_ENUM.MY_LIBRARY,
            subscriberLibrary: req.body.subscriberLibrary,
            viliyoLibrary: req.body.viliyoLibrary,
            tags: req.body.tags
        })
        try {
            const librarySegment = await librarysegmentRepo.createQueryBuilder('librarysegment')
                .where('librarysegment.id =:id', { id: req.body.id })
                .getOne();

            if (librarySegment && librarySegment.is_deleted) {
                res.status(200).json(success(`Segment with id ${req.body.id} is deleted`, {}, res.statusCode));
            } else if (inputlibrarysegment.id === null || inputlibrarysegment.id === 0) {
                const segments = await librarysegmentRepo.createQueryBuilder('segment')
                    .select('COUNT(*)', 'count')
                    .where('segment.libraryid = :libraryid', { libraryid: inputlibrarysegment.library })
                    .andWhere('segment.type = :type', { type: inputlibrarysegment.type })
                    .andWhere('segment.library_plan_status = :status', { status: SESSION_PLAN_STATUS.COMPLETED })
                    .getRawOne();

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (segments.count > 0)
                    inputlibrarysegment.library_plan_status = SESSION_PLAN_STATUS.COMPLETED;
                else
                    inputlibrarysegment.library_plan_status = SESSION_PLAN_STATUS.PENDING;

                const sessionSegment = await librarysegmentRepo.save(inputlibrarysegment);

                // await getRepository(Library).createQueryBuilder()
                //     .update(Library)
                //     .set({ last_updated_at: Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') })
                //     .where({ id: sessionSegment.library })
                //     .execute();

                res.status(200).json(success('', { librarySegment: inputlibrarysegment }, res.statusCode));
            } else {
                const librarySegment: LibrarySegment = inputlibrarysegment;
                await librarysegmentRepo.createQueryBuilder()
                    .update(LibrarySegment)
                    .set({ ...librarySegment })
                    .where('id = :id', { id: inputlibrarysegment.id })
                    .execute();

                // await getRepository(Library).createQueryBuilder()
                //     .update(Library)
                //     .set({ last_updated_at: Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') })
                //     .where({ id: librarySegment.session })
                //     .execute();

                res.status(200).json(success('', { librarySegment }, res.statusCode));
            }
        } catch (e) {
            res.status(400).json(error(`catched error : ${e}`, res.statusCode));
        } finally {
            res.end();
        }
    }

    public async createLibraryActivity(req: Omit<Request, 'body'> & { body: LibraryActivityVo }, res: IResponse): Promise<void> {
        try {
            const libraryActivityRepo = getRepository(LibraryActivity);
            const inputSegmentActivity = req.body;
            const libsegment = await getRepository(LibrarySegment).createQueryBuilder('libregment')
                .where({
                    id: inputSegmentActivity.librarySegmentId,
                    is_deleted: 0
                }).leftJoinAndSelect('libregment.library', 'library')
                .getOne();

            if (!libsegment) {
                res.status(200).json(success(`Session Segment with id ${inputSegmentActivity.librarySegmentId} not found`, {}, res.statusCode));
                return;
            } else {
                inputSegmentActivity.librarySegment = libsegment;
            }

            let libraryActivity = {
                id: inputSegmentActivity.id,
                activity_id: inputSegmentActivity.activity_id,
                activity_data: inputSegmentActivity.activity_data,
                activity_submission_date: inputSegmentActivity.activity_submission_date,
                activate_before_days: inputSegmentActivity.activate_before_days,
                activity_name: inputSegmentActivity.activity_name,
                activityType: inputSegmentActivity.activityType,
                media_attachment: inputSegmentActivity.media_attachment,
                media_attachment_ids: inputSegmentActivity.media_attachment_ids,
                is_deleted: inputSegmentActivity.is_deleted,
                librarySegment: inputSegmentActivity.librarySegment
            }
            if (libraryActivity.id === null || libraryActivity.id === 0) {
                libraryActivity = await libraryActivityRepo.save(libraryActivity);

                res.status(200).json(success('', { libraryActivity }, res.statusCode));
            } else {
                await libraryActivityRepo.createQueryBuilder()
                    .update(LibraryActivity)
                    .set({ ...libraryActivity })
                    .where('id = :id', { id: libraryActivity.id })
                    .execute();

                res.status(200).json(success('', { libraryActivity }, res.statusCode));
            }
        } catch (e) {
            res.status(400).json(error(`Got error : ${e}`, res.statusCode));
        } finally {
            res.end();
        }
    }

    public async getAllLibrary(req: Omit<VTTRequestVO, 'body'> & { body: GetLibraryVO }, res: IResponse): Promise<void> {
        try {
            if(req.body.libraryType === LIBRARY_ENUM.MY_LIBRARY) {
               var library = await getRepository(LibrarySegment).find({
                where: {
                    trainerId: req.user
                }
               })
               res.status(200).json(success('', {library}, res.statusCode));
               return;
            }
            if (req.body.libraryType === LIBRARY_ENUM.SUBSCRIBERS_LIBRARY) {
                var library = await getRepository(LibrarySegment).find({
                    where: {
                        trainerId: req.user,
                        subscriberLibrary: true
                    }
                })
                res.status(200).json(success('', {library}, res.statusCode));
                return;
            }
            if (req.body.libraryType === LIBRARY_ENUM.VILIYO_LIBRARY) {
                var library = await getRepository(LibrarySegment).find({
                    where: {
                        trainerId: req.user,
                        viliyoLibrary: true
                    }
                })
                res.status(200).json(success('', {library}, res.statusCode));
                return
            }
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async getLibraryByType(req: Omit<VTTRequestVO, 'body'> & { body: GetLibraryByTypeVO }, res: IResponse): Promise<void> {
        try {

            const getMyLibrary = async( trainerId, type )=>{
                const library = await getRepository(LibrarySegment).find({
                    where: {
                        trainerId: trainerId,
                        activity_type: type
                    }
                })
                return library;
            }

            const getSubscriberLibrary = async( trainerId, type )=>{
            const library = await getRepository(LibrarySegment).find({
                where: {
                    trainerId: trainerId,
                    activity_type: type,
                    subscriberLibrary:true
                }
            })
            return library;
          }

          const getViliyoLibrary = async( trainerId, type )=>{
            const library = await getRepository(LibrarySegment).find({
                where: {
                    trainerId: trainerId,
                    activity_type: type,
                    viliyoLibrary:true
                }
            })
            return library;
          }

          if( req.body.type == LIBRARY_TYPE_ENUM.SESSION_PLAN )
          {
            if( req.body.libraryType == LIBRARY_ENUM.MY_LIBRARY ){
                const library = await getMyLibrary(req.user,req.body.type)
                res.status(200).json(success('', {library}, res.statusCode));
                return
            }

            if( req.body.libraryType == LIBRARY_ENUM.SUBSCRIBERS_LIBRARY ){
                const library = await getSubscriberLibrary(req.user,req.body.type)
                res.status(200).json(success('', {library}, res.statusCode));
                return
            }

            if( req.body.libraryType == LIBRARY_ENUM.VILIYO_LIBRARY ){ 
                const library = await getViliyoLibrary(req.user,req.body.type)
                res.status(200).json(success('', {library}, res.statusCode));
                return
            }
          }
          
          if( req.body.type == LIBRARY_TYPE_ENUM.ROLE_PLAY )
          {
            if( req.body.libraryType == LIBRARY_ENUM.MY_LIBRARY ){
                const library = await getMyLibrary(req.user,req.body.type)
                res.status(200).json(success('', {library}, res.statusCode));
                return
            }

            if( req.body.libraryType == LIBRARY_ENUM.SUBSCRIBERS_LIBRARY ){
                const library = await getSubscriberLibrary(req.user,req.body.type)
                res.status(200).json(success('', {library}, res.statusCode));
                return
            }

            if( req.body.libraryType == LIBRARY_ENUM.VILIYO_LIBRARY ){ 
                const library = await getViliyoLibrary(req.user,req.body.type)
                res.status(200).json(success('', {library}, res.statusCode));
                return
            }
          }
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async getLibraryById(req: Omit<VTTRequestVO, 'body'> & { body: GetLibraryByIdVO }, res: IResponse): Promise<void> {
        try {
            const library = await getRepository(LibrarySegment).findOne({
                where: {
                    id: req.body.id,
                    trainerId: req.user
                }
            })

            res.status(200).json(success('', {library}, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async createIndependentLibrayActivity(req: Omit<Request, 'body'> & { body: IndependentLibrayActivityVO }, res: IResponse): Promise<void> {
        try {
            let independentActivity = new LibrarySegment({
                title: req.body.name,
                tags: req.body.tags,
                subscriberLibrary: req.body.subscriberLibrary,
                viliyoLibrary: req.body.viliyoLibrary,
                trainerId: req.user,
                mediaUrl: req.body.mediaUrl,
                mediaType: req.body.mediaType,
                activity_data: req.body.activityData,
                activity_type: req.body.activityType,
                isIndependentActivity: true
            })

            await getRepository(LibrarySegment).save(independentActivity)

            res.status(200).json(success('', { independentActivity }, res.statusCode));
        }
        catch (e) {
            res.status(400).json(error(`Got error : ${e}`, res.statusCode));
        }
        finally {
            res.end();
        }
    }


}




const independentSessionnController = IndependentSessionnController.get();

export { independentSessionnController as IndependentSessionnController }












