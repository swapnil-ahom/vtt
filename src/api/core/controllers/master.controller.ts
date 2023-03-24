import {Request, Response} from 'express';
import {getRepository} from 'typeorm';
import {Expertiselist} from '@models/expertiselist.model';
import {Sectorslist} from '@models/sectorslist.model';
import {SubscriptionPlans} from '@models/subscriptionplans.model';
import {AudienceType} from '@models/audiece-type.model';
import {States} from '@models/states.model';
import {Country} from '@models/country.model';
import {InputDetailsVO} from '../types/uiVOs/details-inputVO';
import {BusinessIndustry} from '@models/industry.model';


/**
 * Manage incoming requests from api/{version}/.
 * End points of this router resolve response by itself.
 */
class MasterController {

    /**
     * @description
     */
    private static instance: MasterController;

    private constructor() {
    }

    /**
     * @description
     */
    static get(): MasterController {
        if (!MasterController.instance) {
            MasterController.instance = new MasterController();
        }
        return MasterController.instance;
    }

    /**
     * @description Expertise List api
     *
     * @param req Express request object derived from http.incomingMessage
     * @param res Express response object
     *
     * For record create. we will use this..
     * const data = await repository.create({
          data_id : '11',
          data_name : 'Expert -1'
      });
     await repository.save(data);
     * @param next
     */

    async expertiselist(req: Request, res: Response, next: () => void): Promise<void> {
        const repository = getRepository(Expertiselist);
        const response = await repository.find({
            where: {
                public: 1
            }
        });

        res.json({
            statusCode: 200,
            data: response
        })
        res.status(200);
        res.end();
    }

    /**
     * @description Sectors List api
     *
     * @param req Express request object derived from http.incomingMessage
     * @param res Express response object
     *
     * @param next
     */
    async sectorslist(req: Request, res: Response, next: () => void): Promise<void> {
        const repository = getRepository(Sectorslist);

        const response = await repository.find({
            where: {
                public: 1
            }
        });

        res.json({
            statusCode: 200,
            data: response
        })
        res.status(200);
        res.end();
    }

    /**
     * @description Sectors List api
     *
     * @param req Express request object derived from http.incomingMessage
     * @param res Express response object
     *
     * @param next
     */
    async subscriptionPlans(req: Request, res: Response, next: () => void): Promise<void> {
        const repository = getRepository(SubscriptionPlans);
        const response = await repository.find();
        res.json({
            statusCode: 200,
            data: response
        })
        res.status(200);
        res.end();
    }

    async addAudienceType(req: Request, res: Response, next: () => void): Promise<void> {
        const repo = getRepository(AudienceType);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const audience: AudienceType = await repo.save(req.body);
        res.json({
            statusCode: 200,
            data: audience
        });
        res.status(200);
        res.end();
    }

    async getAudienceList(req: Request, res: Response, next: () => void): Promise<void> {
        const repo = getRepository(AudienceType);
        const audienceList: AudienceType[] = await repo.find();
        res.json({
            statusCode: 200,
            data: audienceList
        });
        res.status(200);
        res.end();
    }

    async getStateList(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: Response, next: () => void): Promise<void> {
        const repo = getRepository(States);
        const countryRepo = getRepository(Country);
        const countryId = req.body.id;
        const country = await countryRepo.findOne({
            where: {
                id: countryId
            }
        })
        const statesList: States[] = await repo.createQueryBuilder('states')
            .where('states.countryId = :countryId', {countryId: country.id}).getMany();
        res.json({
            statusCode: 200,
            data: statesList
        });
        res.status(200);
        res.end();
    }

    async getCountryList(req: Omit<Request, 'body'>, res: Response, next: () => void): Promise<void> {
        const countryRepo = getRepository(Country);
        const countryList: Country[] = await countryRepo.find();
        res.json({
            statusCode: 200,
            data: countryList
        });
        res.status(200);
        res.end();
    }

    async getBusinessIndustryList(req: Omit<Request, 'body'>, res: Response, next: () => void): Promise<void> {
        const industryRepo = getRepository(BusinessIndustry);
        const industryList: BusinessIndustry[] = await industryRepo.find();
        res.json({
            statusCode: 200,
            data: industryList
        });
        res.status(200);
        res.end();
    }
}


const masterController = MasterController.get();

export {masterController as MasterController}
