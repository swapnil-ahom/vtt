export type traineeAttendanceVO = {
    id: number;
    session_map_id: number;
    participant_id?: number;
    email: string;
    status?: string;
}

export type PendingTaskActionVO = {
    id: number;
    action: PendingTaskActions,
    initiator: Initiators;
}

export enum Initiators {
    trainer = 'trainer',
    trainee = 'trainee',
    admin = 'admin',
    subscriber = 'subscriber',
}

export enum PendingTaskActions {
    read = 'read',
    reminder = 'reminder',
    delete = 'delete'
}
