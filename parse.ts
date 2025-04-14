import {
  classBeginPeriod,
  classEndPeriod,
  deadlinesDetail,
  engWeekday,
  weekdayList,
} from "./const/constData";
import data from "./data/schedule.json";
import type { Course, Kdb } from "./types/Kdb";
import type { ScheduleData } from "./types/scheduleData";

const scheduleData: ScheduleData = data;

//Global variables
const beginSpringA = scheduleData.beginSpringA;
const beginSpringB = scheduleData.beginSpringB;
const beginSpringC = scheduleData.beginSpringC;
const beginFallA = scheduleData.beginFallA;
const beginFallB = scheduleData.beginFallB;
const beginFallC = scheduleData.beginFallC;

const springEndDate = scheduleData.springEndDate;
const fallEndDate = scheduleData.fallEndDate;

const springABCEndDate = scheduleData.springABCEndDate;
const fallABCEndDate = scheduleData.fallABCEndDate;

const springAHolidays = scheduleData.springAHolidays;
const springBHolidays = scheduleData.springBHolidays;
const springCHolidays = scheduleData.springCHolidays;
const fallAHolidays = scheduleData.fallAHolidays;
const fallBHolidays = scheduleData.fallBHolidays;
const fallCHolidays = scheduleData.fallCHolidays;

const springABCHolidays = scheduleData.springABCHolidays;
const fallABCHolidays = scheduleData.fallABCHolidays;

const rescheduledDateList = scheduleData.rescheduledDateList;
const rescheduledClassList = scheduleData.rescheduledClassList;

const deadlinesDate = scheduleData.deadlinesDate;

//time stamp is supposed to be a date several days before the date of the first class
const timeStamp = scheduleData.timeStamp;

const createDateFormat = (
  DTSTART: string,
  beginDate: string,
  beginPeriod: string,
  DTEND: string,
  endPeriod: string,
): string => {
  return "".concat(
    DTSTART,
    beginDate,
    "T",
    beginPeriod,
    "\n",
    DTEND,
    beginDate,
    "T",
    endPeriod,
    "\n",
  );
};

const isAvailableModule = (module: string): boolean => {
  return ["春", "秋"].some((season) => module.includes(season));
};

const isAvailableDay = (period: string): boolean => {
  //There's no Sunday class in the year
  return weekdayList.includes(period.slice(0, 1));
};

const getModulePeriodList = (
  moduleList: string[][],
  periodList: string[][],
): string[][] => {
  const modulePeriodList: string[][] = [];
  let tmpList: string[] = [];
  let newPeriodList: string[][];

  if (moduleList.length === 1 && periodList.length > 1) {
    for (let i = 0; i < periodList.length; i++) {
      tmpList = tmpList.concat(periodList[i]);
    }
    newPeriodList = [tmpList];
  } else {
    newPeriodList = periodList;
  }

  for (let i = 0; i < moduleList.length; i++) {
    for (let j = 0; j < moduleList[i].length; j++) {
      for (let k = 0; k < newPeriodList[i].length; k++) {
        modulePeriodList.push([moduleList[i][j], newPeriodList[i][k]]);
      }
    }
  }
  return modulePeriodList;
};

const getSpan = (
  module: string,
  beginPeriod: string,
  endPeriod: string,
): string => {
  let beginDate = "";
  const DTSTART = "DTSTART;TZID=Asia/Tokyo:";
  const DTEND = "DTEND;TZID=Asia/Tokyo:";

  //Get the start and end date of the module
  if (module[0] === "春") {
    switch (module[1]) {
      case "A":
        beginDate = beginSpringA[beginPeriod[0]];
        break;

      case "B":
        beginDate = beginSpringB[beginPeriod[0]];
        break;

      case "C":
        beginDate = beginSpringC[beginPeriod[0]];
        break;
    }
  } else {
    switch (module[1]) {
      case "A":
        beginDate = beginFallA[beginPeriod[0]];
        break;

      case "B":
        beginDate = beginFallB[beginPeriod[0]];
        break;

      case "C":
        beginDate = beginFallC[beginPeriod[0]];
        break;
    }
  }

  //Get the start and end time of the course
  const _beginPeriod: string =
    classBeginPeriod[Number.parseInt(beginPeriod.slice(1, 2))];
  const _endPeriod: string =
    classEndPeriod[Number.parseInt(endPeriod.slice(-1))];

  return createDateFormat(DTSTART, beginDate, _beginPeriod, DTEND, _endPeriod);
};

const addReschedule = (
  index: number,
  beginPeriod: string,
  endPeriod: string,
): string => {
  const beginDate: string = rescheduledDateList[index];
  const DTSTART = "DTSTART;TZID=Asia/Tokyo:";
  const DTEND = "DTEND;TZID=Asia/Tokyo:";

  //Get the start and end time of the course
  const _beginPeriod: string =
    classBeginPeriod[Number.parseInt(beginPeriod.slice(1, 2))];
  const _endPeriod: string =
    classEndPeriod[Number.parseInt(endPeriod.slice(-1))];

  return createDateFormat(DTSTART, beginDate, _beginPeriod, DTEND, _endPeriod);
};

const getRepeat = (module: string, period: string): string => {
  let rrule = "RRULE:FREQ=WEEKLY;UNTIL=";
  const exdate = removeHolidays(module, period);

  rrule +=
    module[0] === "春"
      ? springEndDate[module.slice(-1)]
      : fallEndDate[module.slice(-1)];

  rrule += `BYDAY=${engWeekday[period[0]]}\n`;
  return rrule + exdate;
};

//For ABC module class
const getABCRepeat = (module: string, period: string): string => {
  let rrule = "RRULE:FREQ=WEEKLY;UNTIL=";
  const exdate = removeABCHolidays(module, period);

  rrule += module[0] === "春" ? springABCEndDate : fallABCEndDate;

  rrule += `BYDAY=${engWeekday[period[0]]}\n`;
  return rrule + exdate;
};

const getMisc = (name: string, classroom: string, desc: string): string => {
  const dtstamp = `DTSTAMP:${timeStamp}`;
  const created = `CREATED:${timeStamp}`;
  const description = `DESCRIPTION:${desc}`;
  const lastModified = `LAST-MODIFIED:${timeStamp}`;
  const classroomLocation = `LOCATION:${classroom}`;
  const sequence = "SEQUENCE:0";
  const confirmed = "STATUS:CONFIRMED";
  const summary = `SUMMARY:${name}`;
  const transp = "TRANSP:OPAQUE";

  return [
    dtstamp,
    created,
    description,
    lastModified,
    classroomLocation,
    sequence,
    confirmed,
    summary,
    transp,
  ].join("\n");
};

const removeHolidays = (module: string, period: string): string => {
  const beginPeriod: string =
    classBeginPeriod[Number.parseInt(period.slice(1, 2))];
  let holidaysList: string[] = [];
  let exdate = "EXDATE:";

  if (module[0] === "春") {
    for (let i = 1; i < module.length; i++) {
      if (module[i] === "A")
        holidaysList = holidaysList.concat(springAHolidays);
      else if (module[i] === "B")
        holidaysList = holidaysList.concat(springBHolidays);
      else if (module[i] === "C")
        holidaysList = holidaysList.concat(springCHolidays);
    }
  }

  if (module[0] === "秋") {
    for (let i = 1; i < module.length; i++) {
      if (module[i] === "A") holidaysList = holidaysList.concat(fallAHolidays);
      else if (module[i] === "B")
        holidaysList = holidaysList.concat(fallBHolidays);
      else if (module[i] === "C")
        holidaysList = holidaysList.concat(fallCHolidays);
    }
  }

  //Check if the list is blank
  if (!holidaysList.length) {
    return "";
  }

  for (let i = 0; i < holidaysList.length; i++) {
    exdate += `${holidaysList[i]}T${beginPeriod},`;
  }

  return `${exdate}\n`;
};

//For ABC classes
const removeABCHolidays = (module: string, period: string): string => {
  const beginPeriod: string =
    classBeginPeriod[Number.parseInt(period.slice(1, 2))];
  const holidaysList = module[0] === "春" ? springABCHolidays : fallABCHolidays;
  let exdate = "EXDATE:";

  for (const holiday of holidaysList) {
    exdate += `${holiday}T${beginPeriod},`;
  }

  return `${exdate}\n`;
};

const addDeadlines = (): string => {
  const deadlinesList: string[] = [];
  const misc =
    "DTSTAMP:20220408T000000\nCREATED:20220408T000000\nSTATUS:CONFIRMED\nTRANSP:TRANSPARENT\n";
  let dtstart: string;
  let dtend: string;
  let nextDate: string;
  let summary: string;
  let icsEvent: string;
  for (const deadline of deadlinesDate) {
    dtstart = `DTSTART;VALUE=DATE:${deadline}\n`;
    nextDate = String(Number(deadline) + 1);
    dtend = `DTEND;VALUE=DATE:${nextDate}\n`;
    summary = `SUMMARY:${deadlinesDetail[deadlinesDate.indexOf(deadline)]}\n`;
    icsEvent = `BEGIN:VEVENT\n${dtstart}${dtend}${misc}${summary}END:VEVENT\n`;
    deadlinesList.push(icsEvent);
  }
  return deadlinesList.join("");
};

function groupConsecutivePeriods(data: string[][]): string[][][] {
  const result: string[][][] = [];

  // Convert a string to a period number (e.g. 'Tue 1' → { day: 'Tue', period: 1 })
  const parseDayAndPeriod = (str: string) => {
    const day = str[0];
    const period = Number.parseInt(str.slice(1), 10);
    return { day, period };
  };

  // Timed group definition
  const validSequences = [
    [1, 2],
    [3, 4, 5, 6],
  ];

  // Group by same key
  const groups: { [key: string]: string[][] } = {};
  for (const pair of data) {
    const key = `${pair[0]}-${pair[1][0]}`; // 例: '秋AB-火'
    if (!groups[key]) groups[key] = [];
    groups[key].push(pair);
  }

  for (const key in groups) {
    const group = groups[key];

    // Sort by time period
    group.sort((a, b) => {
      const pa = parseDayAndPeriod(a[1]);
      const pb = parseDayAndPeriod(b[1]);
      return pa.period - pb.period;
    });

    let current: string[][] = [];
    for (let i = 0; i < group.length; i++) {
      const currentPeriod = parseDayAndPeriod(group[i][1]).period;

      if (current.length === 0) {
        current.push(group[i]);
      } else {
        const lastPeriod = parseDayAndPeriod(
          current[current.length - 1][1],
        ).period;
        const sequence = validSequences.find((seq) => seq.includes(lastPeriod));

        if (
          sequence?.includes(currentPeriod) &&
          currentPeriod === lastPeriod + 1
        ) {
          current.push(group[i]);
        } else {
          result.push(current);
          current = [group[i]];
        }
      }
    }

    if (current.length > 0) {
      result.push(current);
    }
  }

  return result;
}

export const parseCSV = (
  tmpidList: string[],
  kdb: Kdb,
  ifDeadlinesIncluded: boolean,
  combineSameClasses = false,
  classroomMap: Record<string, string> = {},
): string => {
  let output =
    "BEGIN:VCALENDAR\nPRODID:-//gam0022//TwinC 1.0//EN\nVERSION:2.0\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:授業時間割\nX-WR-TIMEZONE:Asia/Tokyo\nX-WR-CALDESC:授業時間割\nBEGIN:VTIMEZONE\nTZID:Asia/Tokyo\nX-LIC-LOCATION:Asia/Tokyo\nBEGIN:STANDARD\nTZOFFSETFROM:+0900\nTZOFFSETTO:+0900\nTZNAME:JST\nDTSTART:19700102T000000\nEND:STANDARD\nEND:VTIMEZONE\n";
  let idList = tmpidList.filter((ele, pos) => tmpidList.indexOf(ele) === pos);

  idList = idList.map((x) => x.replace(/["]/g, ""));
  idList = idList.map((x) => x.replace(/\r/g, ""));

  const eventBegin = "BEGIN:VEVENT\n";
  const eventEnd = "\nEND:VEVENT\n";
  const courseList: Course[] = [];

  //Search courses
  for (let i = 0; i < idList.length; i++) {
    try {
      courseList.push(kdb[idList[i]]);
    } catch (error) {
      //Do nothing
    }
  }

  for (let i = 0; i < courseList.length; i++) {
    let name: string;
    let moduleList: string[][];
    let periodList: string[][];
    let classroom: string;
    let description: string;
    try {
      name = courseList[i].name;
      moduleList = courseList[i].module;
      periodList = courseList[i].period;
      classroom = classroomMap[idList[i]] || courseList[i].room;
      description = courseList[i].description;
    } catch (error) {
      continue;
    }

    const modulePeriodList: string[][] = getModulePeriodList(
      moduleList,
      periodList,
    );
    const groupedModulePeriodList = combineSameClasses
      ? groupConsecutivePeriods(modulePeriodList)
      : [modulePeriodList];

    for (let j = 0; j < groupedModulePeriodList.length; j++) {
      const module = groupedModulePeriodList[j][0][0];
      const beginPeriod = groupedModulePeriodList[j][0][1];
      const endPeriod =
        groupedModulePeriodList[j][groupedModulePeriodList[j].length - 1][1];
      let icsEvent = "";

      if (
        !isAvailableModule(module) ||
        !isAvailableDay(beginPeriod) ||
        !isAvailableDay(endPeriod)
      )
        continue;

      if (module.slice(1) === "ABC") {
        icsEvent =
          getSpan(module, beginPeriod, endPeriod) +
          getABCRepeat(module, beginPeriod) +
          getMisc(name, classroom, description);
        output += eventBegin + icsEvent + eventEnd;
      } else {
        icsEvent =
          getSpan(module, beginPeriod, endPeriod) +
          getRepeat(module, beginPeriod) +
          getMisc(name, classroom, description);
        output += eventBegin + icsEvent + eventEnd;
      }

      for (let k = 1; k < module.length; k++) {
        const devidedModule = module[0] + module[k];
        const devidedPeriod = beginPeriod[0];

        for (let i = 0; i < rescheduledClassList.length; i++) {
          if (rescheduledClassList[i] === `${devidedModule}:${devidedPeriod}`) {
            icsEvent =
              addReschedule(i, beginPeriod, endPeriod) +
              getMisc(name, classroom, description);
            output += eventBegin + icsEvent + eventEnd;
          }
        }
      }
    }
  }

  //Add register deadlines to the calendar if checked
  if (ifDeadlinesIncluded) {
    output += addDeadlines();
  }
  return output;
};
export default parseCSV;
