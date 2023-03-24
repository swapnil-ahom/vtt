import { CHAT_TYPE_ENUM } from "../../types/enums/chat-type.enum";

export type chatDetailsVO = {
    id: number;
    type : string;
    room_id : string;
    session_map_id : number;
    message_by_id : number;
    message_to_id : number;
    user_message_data : any;
    message_by_type : string;
    message_by : string;
    message_type : CHAT_TYPE_ENUM;
    message_to : string;
    message : string;
    created_at : string;

}



