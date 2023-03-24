import { getRepository } from 'typeorm';
import { Notification } from '../models/Notification.model';


export async function addNotification (pertain_to:number,user_type:any,content:string){
    
    const newNotification = new Notification();

    newNotification.pertain_to = pertain_to;
    newNotification.user_type = user_type;
    newNotification.content = content;

    await getRepository(Notification).insert(newNotification);


}
