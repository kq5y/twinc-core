const normalize = (value: string) =>
  value.replace(/\uFEFF/g, "").replace(/"/g, "").trim();

const isCourseId = (value: string) =>
  /^(?=.*[A-Z].*[A-Z])(?=.*\d.*\d.*\d.*\d)[A-Z0-9]{7,8}$/.test(value);

export const createIdList = (fileContent: string, isFromKdBAlt: boolean) => {
  const candidates = isFromKdBAlt
    ? fileContent.split("\n").map((line) => normalize(line.split(",")[0] ?? ""))
    : fileContent.split("\n").map(normalize);

  return candidates
    .filter((value) => value !== "科目番号")
    .filter(isCourseId)
    .filter((value, index, self) => self.indexOf(value) === index);
};
