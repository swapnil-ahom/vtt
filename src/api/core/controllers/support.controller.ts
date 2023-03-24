import { Request } from 'express';
import { IResponse } from '@interfaces';
import { success, error, sendEmail } from '@utils/common.util';
const dayjs = require('dayjs');
import { getRepository } from 'typeorm';
import { FAQ } from '@models/faq.model';
import { Support_Query } from '@models/support-query.model';
import { Feedback } from '@models/feedback.model';
import { New_Release } from '@models/new-release.model';
import { Feature_Request } from '../models/feature-request.model'
import { Contact_Support } from '../models/contact-support.model';
import { Viliyo_Tutorials } from '../models/viliyo-tutorials.model';

class SupportController {
  private static instance: SupportController;

  static get(): SupportController {
    if (!SupportController.instance) {
      SupportController.instance = new SupportController();
    }
    return SupportController.instance;
  }

  public async getViliyoTutorials(req: Request, res: IResponse): Promise<void> {
    try {
      let allTutorials
      let recentTutorials
      if (req.query.id) {
        allTutorials = await getRepository(Viliyo_Tutorials).createQueryBuilder('viliyo_tutorial')
          .where('viliyo_tutorial.id =:id', { id: req.query.id })
          .getOne()
      } else {
        allTutorials = await getRepository(Viliyo_Tutorials).createQueryBuilder('viliyo_tutorial')
        .getMany()

        recentTutorials = await getRepository(Viliyo_Tutorials).createQueryBuilder('viliyo_tutorial')
        .orderBy('id','DESC')
        .limit(3)
        .getMany()
      }

      res.status(200).json(success('', {allTutorials,recentTutorials}, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async createUpdateFAQ(req: Request, res: IResponse): Promise<void> {
    try {
      // create/update post API
      let responseData;
      const todaysDate = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const faqData = await getRepository(FAQ).findOne({
        where: { id: req.body.id },
      });

      if (faqData) {
        faqData.topic = req.body.topic;
        faqData.description = req.body.description;
        faqData.updated_at = todaysDate;
        await getRepository(FAQ).save(faqData);
        responseData = faqData;
      } else {
        const faqData = new FAQ(req.body);
        faqData.topic = req.body.topic;
        faqData.description = req.body.description;
        faqData.created_at = todaysDate;
        await getRepository(FAQ).insert(faqData);
        responseData = faqData;
      }

      res.status(200).json(success('FAQ added successfully', responseData, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async readFAQ(req: Request, res: IResponse): Promise<void> {
    try {
      // read all FAQs once...
      const faqData = await getRepository(FAQ).find();

      res.status(200).json(success('all FAQs fetched successfully', faqData, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async deleteFAQ(req: Request, res: IResponse): Promise<void> {
    try {
      // delete a FAQ
      const faqData = await getRepository(FAQ).findOne({
        where: { id: req.body.id },
      });
      if (faqData) {
        await getRepository(FAQ).delete(faqData);
      }

      res.status(200).json(success('FAQ deleted successfully', faqData, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async raiseSupportQuery(req: Request, res: IResponse): Promise<void> {
    try {
      // post a new support query
      const todaysDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const queryData = new Support_Query(req.body);

      queryData.query = req.body.query;
      queryData.callbackRequired = req.body.callbackRequired;
      queryData.contact_number = req.body.contact_number;
      queryData.media_file = req.body.media_file;
      queryData.created_at = todaysDate;

      await getRepository(Support_Query).insert(queryData);

      // TODO : send mail to vtt email as well
      let isCallbackRequired
      if(req.body.callbackRequired ===true){
        isCallbackRequired = 'is';
      }else{
        isCallbackRequired = 'is not'
      }

      const mailContent = `There is a query raised by trainer with query - "${req.body.query}". Contact Number - ${req.body.contact_number}. And call back ${isCallbackRequired} required.`
      sendEmail('support@viliyo.com',mailContent)

      res.status(200).json(success('query raised successfully', queryData, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async getSupportQueries(req: Request, res: IResponse): Promise<void> {
    // pass id in query...get one query --> else get all queries
    try {

      let queryData

      if (req.query.id) {

        queryData = await getRepository(Support_Query).findOne({
          where: { id: req.query.id }
        });

      } else {

        queryData = await getRepository(Support_Query).find();

      }

      res.status(200).json(success('support query data fetched successfully', queryData, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async sendFeedback(req: Request, res: IResponse): Promise<void> {
    try {

      const todaysDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const feedbackData = new Feedback(req.body);

      feedbackData.viliyo_experience = req.body.viliyo_experience;
      feedbackData.will_recommend = req.body.will_recommend;
      feedbackData.feedback = req.body.feedback;
      feedbackData.anonymously = req.body.anonymously;
      feedbackData.created_at = todaysDate;

      await getRepository(Support_Query).insert(feedbackData);

      // TODO : send mail to vtt email as well

      let willRecommend
      if(req.body.will_recommend ===true){
        willRecommend = 'did';
      }else{
        willRecommend = 'did not'
      }

      let anonymous
      if(req.body.anonymously ===true){
        anonymous = 'is';
      }else{
        anonymous = 'is not'
      }

      const mailContent = `There is a feedback given by trainer which is : ${req.body.feedback}. The trainer ${willRecommend} choose to recommend viliyo to others as well. And this feedback ${anonymous} shared anonymously.`
      sendEmail('support@viliyo.com',mailContent)

      res.status(200).json(success('feedback added successfully successfully', feedbackData, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async getFeedback(req: Request, res: IResponse): Promise<void> {
    // pass id in query...get one query --> else get all queries
    try {

      let feedbackData

      if (req.query.id) {

        feedbackData = await getRepository(Feedback).findOne({
          where: { id: req.query.id }
        });

      } else {

        feedbackData = await getRepository(Support_Query).find();

      }

      res.status(200).json(success('', feedbackData, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }


  public async addNewRelease(req: Request, res: IResponse): Promise<void> {
    try {
      const newRepo = getRepository(New_Release)
      const newReleaseRepo = getRepository(New_Release).findOne({ id: req.body.id })
      if (req.body.id && newReleaseRepo) {
        await getRepository(New_Release).createQueryBuilder()
          .update(New_Release)
          .set({
            title: req.body.title,
            description: req.body.description
          })
          .where({ id: req.body.id })
          .execute();
        res.status(200).json(success('data update successfully', req.body, res.statusCode));
        res.end()
      } else {
        const _newRelease = {
          title: req.body.title,
          description: req.body.description
        }
        const newRelease: New_Release = await newRepo.save(_newRelease);
        res.status(200).json(success('data save successfully', newRelease, res.statusCode));
        res.end()
      }

    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }


  public async getNewRelease(req: Request, res: IResponse): Promise<void> {
    try {
      let NewRelease
      if(req.query.id){
        NewRelease = await getRepository(New_Release).createQueryBuilder('newRelease')
        .where('newRelease.id =:id', { id: req.query.id })
        .getOne()
      }else{
        NewRelease = await getRepository(New_Release).createQueryBuilder('newRelease')
        .getMany()
      }


      res.status(200).json(success('', NewRelease, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }


  public async addFeatureRequest(req: Request, res: IResponse): Promise<void> {
    try {
      const featureRepo = getRepository(Feature_Request)
      const featureRequest = getRepository(Feature_Request).findOne({ id: req.body.id })
      if (req.body.id && featureRequest) {
        await getRepository(Feature_Request).createQueryBuilder()
          .update(Feature_Request)
          .set({
            feature_request: req.body.feature_request
          })
          .where({ id: req.body.id })
          .execute();
        res.status(200).json(success('data update successfully', req.body, res.statusCode));
        res.end()
      } else {
        const _newRelease = {
          feature_request: req.body.feature_request
        }
        const _featureRequest: Feature_Request = await featureRepo.save(_newRelease);
        res.status(200).json(success('data save successfully', _featureRequest, res.statusCode));
        res.end()
      }

    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async getFeatureRequest(req: Request, res: IResponse): Promise<void> {
    try {
      let FeatureRequest
      if (req.query.id) {
        FeatureRequest = await getRepository(Feature_Request).createQueryBuilder('feature_request')
          .where('feature_request.id =:id', { id: req.query.id })
          .getOne()
      } else {
        FeatureRequest = await getRepository(Feature_Request).createQueryBuilder('feature_request')
          .getMany()
      }
      res.status(200).json(success('', FeatureRequest, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async addContactSupport(req: Request, res: IResponse): Promise<void> {
    try {
      const contactSupportRepo = getRepository(Contact_Support);

      const contactSupportData = {
        description: req.body.description,
        file: req.body.file,
        need_call_back: req.body.need_call_back,
        phone: req.body.phone
      }
      const contactSupport: { file: any; phone: any; need_call_back: any; description: any } = await contactSupportRepo.save(contactSupportData);
      res.status(200).json(success('data save successfully', contactSupport, res.statusCode));
      res.end()


    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }


  public async getContactSupport(req: Request, res: IResponse): Promise<void> {
    try {
      let ContactSupport
      if (req.query.id) {
        ContactSupport = await getRepository(Contact_Support).createQueryBuilder('contact_support')
          .where('contact_support.id =:id', { id: req.query.id })
          .getOne()
      } else {
        ContactSupport = await getRepository(Contact_Support).createQueryBuilder('contact_support')
          .getMany()
      }

      res.status(200).json(success('', ContactSupport, res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }



}

const supportController = SupportController.get();

export { supportController as SupportController }
