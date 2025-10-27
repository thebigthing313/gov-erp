import { getUTCDate } from "@/lib/date-fns";

const holidayFunctionMap: Record<string, (year: number) => Date> = {
    "578dc39b-2ff1-4184-bcce-2d31c19ea0e3": getNewYearsDay,
    "90a8b962-db6c-43c8-b995-a06a9f9f2e87": getMLKDay,
    "932e9e62-75a2-4453-82d4-0ac9c81c5d6b": getLincolnsBirthday,
    "8589f561-5bbb-46fc-9390-0fb5ecf55545": getPresidentsDay,
    "d8668b92-9511-4d09-ac71-3ef5548304a9": getGoodFriday,
    "28e5b22b-f43d-4b8c-a9f9-b91bb29d8f47": getMemorialDay,
    "b768f036-f9c4-488b-b9e7-e0909e22ce92": getJuneteenthNJ,
    "9af07bea-cdd1-46a2-9612-2a85049ecf44": getIndependenceDay,
    "06f5da74-8064-45bc-b79e-aca3604cee1e": getLaborDay,
    "bb269017-dd08-41e5-b068-20162b7a03e8": getColumbusDay,
    "a124e348-5125-4f4a-8f10-a9d812ada709": getElectionDay,
    "e32181c1-b23f-4b69-b56f-5faccb97a535": getVeteransDay,
    "eb3aec2d-c82e-453c-b737-2464f7a5324f": getThanksgivingDay,
    "e3a2ad37-f799-450c-a61d-8349fb9517cc": getDayAfterThanksgiving,
    "ca2e3381-b892-4ce5-80d7-379dd6863c55": getChristmasDay,
};

export function getHolidayDate(
    year: number,
    holiday_id: string,
): Date | null {
    return holidayFunctionMap[holiday_id]?.(year) ?? null;
}

function getNewYearsDay(year: number): Date {
    return getUTCDate(year, 0, 1);
}

function getMLKDay(year: number): Date {
    const januaryFirst = getUTCDate(year, 0, 1);
    const jan1stDayOfWeek = januaryFirst.getUTCDay();
    const daysToAddForFirstMonday = (8 - jan1stDayOfWeek) % 7;
    const dayOfFirstMonday = 1 + daysToAddForFirstMonday;
    const dayOfThirdMonday = dayOfFirstMonday + 14;
    return getUTCDate(year, 0, dayOfThirdMonday);
}

function getLincolnsBirthday(year: number): Date {
    return getUTCDate(year, 1, 12);
}

function getPresidentsDay(year: number): Date {
    const februaryFirst = getUTCDate(year, 1, 1);
    const feb1stDayOfWeek = februaryFirst.getUTCDay();
    const daysToAddForFirstMonday = (8 - feb1stDayOfWeek) % 7;
    const dayOfFirstMonday = 1 + daysToAddForFirstMonday;
    const dayOfThirdMonday = dayOfFirstMonday + 14;
    return getUTCDate(year, 1, dayOfThirdMonday);
}

function getGoodFriday(year: number): Date {
    // Calculate Easter Sunday using Anonymous Gregorian algorithm
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 16);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const easterMonth = Math.floor((h + l - 7 * m + 114) / 31); // 3 or 4
    const easterDay = ((h + l - 7 * m + 114) % 31) + 1;

    const goodFridayMonth = easterMonth - 1;
    const goodFridayDay = easterDay - 2;

    return getUTCDate(year, goodFridayMonth, goodFridayDay);
}

function getMemorialDay(year: number): Date {
    const mayLast = getUTCDate(year, 4, 31);
    const mayLastDayOfWeek = mayLast.getUTCDay();
    const daysToSubtract = (mayLastDayOfWeek + 6) % 7;
    const lastMondayDay = 31 - daysToSubtract;
    return getUTCDate(year, 4, lastMondayDay);
}
function getJuneteenthNJ(year: number): Date {
    const juneFirst = getUTCDate(year, 5, 1);
    const june1stDayOfWeek = juneFirst.getUTCDay();
    const daysToAddForFirstFriday = (7 + 5 - june1stDayOfWeek) % 7;
    const dayOfFirstFriday = 1 + daysToAddForFirstFriday;
    const dayOfThirdFriday = dayOfFirstFriday + 14;
    return getUTCDate(year, 5, dayOfThirdFriday);
}

function getIndependenceDay(year: number): Date {
    return getUTCDate(year, 6, 4);
}

function getLaborDay(year: number): Date {
    const septemberFirst = getUTCDate(year, 8, 1);
    const sept1stDayOfWeek = septemberFirst.getUTCDay();
    const daysToAddForFirstMonday = (7 + 1 - sept1stDayOfWeek) % 7;
    const dayOfFirstMonday = 1 + daysToAddForFirstMonday;
    return getUTCDate(year, 8, dayOfFirstMonday);
}

function getColumbusDay(year: number): Date {
    const octoberFirst = getUTCDate(year, 9, 1);
    const oct1stDayOfWeek = octoberFirst.getUTCDay();
    const daysToAddForFirstMonday = (7 + 1 - oct1stDayOfWeek) % 7;
    const dayOfFirstMonday = 1 + daysToAddForFirstMonday;
    const dayOfSecondMonday = dayOfFirstMonday + 7;
    return getUTCDate(year, 9, dayOfSecondMonday);
}

function getElectionDay(year: number): Date {
    const novemberFirst = getUTCDate(year, 10, 1);
    const nov1stDayOfWeek = novemberFirst.getUTCDay();
    const daysToAddForFirstMonday = (7 + 1 - nov1stDayOfWeek) % 7;
    const dayOfFirstMonday = 1 + daysToAddForFirstMonday;
    const electionDay = dayOfFirstMonday + 1;
    return getUTCDate(year, 10, electionDay);
}

function getVeteransDay(year: number): Date {
    return getUTCDate(year, 10, 11);
}

function getThanksgivingDay(year: number): Date {
    const novemberFirst = getUTCDate(year, 10, 1);
    const nov1stDayOfWeek = novemberFirst.getUTCDay();
    const daysToAddForFirstThursday = (7 + 4 - nov1stDayOfWeek) % 7;
    const dayOfFirstThursday = 1 + daysToAddForFirstThursday;
    const dayOfFourthThursday = dayOfFirstThursday + 21;
    return getUTCDate(year, 10, dayOfFourthThursday);
}

function getDayAfterThanksgiving(year: number): Date {
    const thanksgiving = getThanksgivingDay(year);
    const yearComponent = thanksgiving.getUTCFullYear();
    const monthComponent = thanksgiving.getUTCMonth();
    const dayComponent = thanksgiving.getUTCDate();
    return getUTCDate(yearComponent, monthComponent, dayComponent + 1);
}

function getChristmasDay(year: number): Date {
    return getUTCDate(year, 11, 25);
}
