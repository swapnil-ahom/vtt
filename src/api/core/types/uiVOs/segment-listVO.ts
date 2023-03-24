import { Library } from '@models/libary.model';
import { SeatingStyle } from '@models/seating-style.model';
import  SessionMapping  from '@models/session-mapping.model';
import Sessions from '@models/sessions.model';
import {SessionSegment} from "@models/session_segment.model";

export interface SegmentListVO {
    Pre: SessionSegment[];
    Post: SessionSegment[];
    Live: SessionSegment[];
    session: Sessions;
    batches:SessionMapping[];
    seatingStyle:SeatingStyle[];
    Seatingstyle:SeatingStyle[];
    library:Library
}
