
export class SlotCalculatorService {
    private slotMap = new Map();

    constructor() {
        const slotKeys = ["00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30",
            "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
            "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
            "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];
        slotKeys.forEach((slot: string, index: number) => {
            this.slotMap.set(slot, (index + 1));
        })
    }

    getSlotMap() {
        console.log('getting dataa')
        return this.slotMap;
    }

    getSlotListCommaSeparated(startTime, endTime, slotMap) {
        console.log('Getting slot list with ', startTime, endTime );
         let slotList: string = '';
         const startIndex = slotMap.get(startTime);
         const endIndex = slotMap.get(endTime);
         for( let index = startIndex; index < endIndex; index ++){
             if (index == startIndex){
                 slotList += index;
             } else {
                 slotList = slotList + ',' + index;
             }
         }
         console.log('Returning the slot list', slotList);
         return slotList;
    }

    getSlotListAsArrayByInterval(startTime, endTime, slotMap) {
        console.log('Getting slot list with ', startTime, endTime );
        let slotList: string[] = [];
        const startIndex = slotMap.get(startTime);
        const endIndex = slotMap.get(endTime);
        for( let index = startIndex; index < endIndex; index ++){
            slotList.push(index)
        }
        console.log('Returning the slot list in list format', slotList);
        return slotList;
    }

    convertSlotListToCommaString(slotList: string[]){
        let slotString = '';
        slotList.forEach((item, index) => {
            if(index == 0){
                slotString += item;
            } else {
                slotString += ',' + item
            }
        });
        return slotString;
    }
}
