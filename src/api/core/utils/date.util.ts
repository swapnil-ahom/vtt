/**
 * @description Get age from birthdate
 * @param dateString
 */
import {Between} from 'typeorm';
import { addYears, subYears } from 'date-fns';


const getAge = ( dateString: string ): number => {
  const today = new Date();
  const birthDate = new Date( dateString );
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if ( m < 0 || ( m === 0 && today.getDate() < birthDate.getDate() ) ) {
    age--;
  }
  return age;
}

export const DateUtil = {
  getCurrentUnixTime(): number {
    return Math.trunc(Date.now() / 1000);
},
}

export { getAge }