interface TrainingRoomVO {
    sessionMapId: number,
}

interface ParticipantJoinVO extends TrainingRoomVO{
    email: string;
}

interface BreakOutParticipants {
    email: string;
    id: number;
}

interface BreakOutRoom {
    roomId?: string;
    participants: BreakOutParticipants[];
}

interface BreakOutRoomVO {
    roomId?: string;
    sessionMapId: number;
    roomJoinLink: string;
    roomParticipants: BreakOutRoom[];
}


export { TrainingRoomVO, ParticipantJoinVO, BreakOutRoomVO, BreakOutParticipants, BreakOutRoom  }
