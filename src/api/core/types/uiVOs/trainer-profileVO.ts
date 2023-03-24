import { StringSchema } from "joi";

export type TrainerProfileVO =  {

    fullname ?: string;
    experienceAsTrainer ?: number;
    areaOfExpertise ?: string;
    sectorCaterTo ?: string;
    age_group ?: string;
    trainer ?: string;
    educational_qualification ?: string;
    hobbies ?: string;
    roleName ?: string;
    town_city ?: string;
    country ?: string;
    website ?: string;
    industry ?: string;
    organisationName ?: string;
    address ?: string;
    nationality ?: string;
    contactNumber ?: string;
    micrositeLink ?: string;
    shortBio ?: string;
    resume ?: string;
    videoOrAttachments ?: string;
    profilePhoto ?: string;
    facebookLink ?: string;
    instagramLink ?: string;
    linkedinLink ?: string;
    pinterestLink ?: string;
}