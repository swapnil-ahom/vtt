import { REACTION_TYPE_ENUM } from "../../types/enums/reaction-type.enum";
import { REACTED_BY_TYPE_ENUM } from "../../types/enums/reacted-by-type.enum";

export type SessionReactionVO = {
    id ?: string;
    session_map_id : number;
    reaction_type ?: REACTION_TYPE_ENUM;
    reacted_by : string;
    reacted_by_type ?: REACTED_BY_TYPE_ENUM;
    user_reaction_data ?: string;  
}