export interface CreateUserVO {
    name: string;
    email : string;
    phone: string;
}

export interface subUsersVO {
    email: string;
    name: string;
}

export interface CreateSubUsersVO {
    users?: subUsersVO[];
    organisation_level: string;
    department: string;
    designation: string;
    subscriberId?: string;
}

export interface AssignRoleVO {
    roleId: number;
    userId: number[];
}

export interface DeleteSubUserVO {
    id: number;
}

export interface UpdateSubUserVO {
    id: number;
    name: string;
    email: string;
    organisation_level: string;
    department: string;
    designation: string;
    subscriberId?: string;
    verified: boolean
}


