import { createIdList } from "./createIdList";
import { fetchKdb } from "./fetchKdb";
import parseCSV from "./parse";

const createICS = async (
  fileContent: string,
  ifDeadlinesIncluded: boolean,
  combineSameClasses = false,
) => {
  const kdb = await fetchKdb();
  const isFromKdBAlt = fileContent.slice(0, 1) === "科";
  const idList = createIdList(fileContent, isFromKdBAlt);
  return `${parseCSV(idList, kdb, ifDeadlinesIncluded, combineSameClasses)}END:VCALENDAR`;
};

export default createICS;
