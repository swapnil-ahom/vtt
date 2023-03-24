import {Request, Response} from "express";

export interface VTTRequestVO extends Request {
    user: number;
}
