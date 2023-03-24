import {BreakOutParticipants} from "../types/uiVOs/training-roomVO";
import {Participants} from "@models/participants.model";

export class RoomValidationSuite {
    constructor() {
    }
    convertListToCommaSeparated(participantList: BreakOutParticipants[]){
        let list = '';
        participantList.forEach((participant, index) => {
            if(index === 0){
                list += participant.id;
            } else {
                list += ',' + participant.id;
            }
        });
        return list;
    }

    addParticipantToRoom(existingList: string, participant: Participants){
        if(existingList.includes(participant.id.toString())){
            // do nothing. User is trying to rejoin
        } else {
            if(existingList.length == 0){
                existingList += participant.id;
            } else {
                existingList += ',' + participant.id;
            }
        }
        return existingList;
    }
}
