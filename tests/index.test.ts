import { readFileSync } from "node:fs";
import { createIdList } from "../createIdList";
import kdb from "../data/sample-2023.json";
import parseCSV from "../parse";

describe("createIdList from TWINS data", () => {
  const fileContent = readFileSync("tests/twins-data.csv", "utf-8");
  const idList = createIdList(fileContent, false);
  it("should return an array", () => {
    expect(Array.isArray(idList)).toBe(true);
  });
  it("should return an valid array", () => {
    expect(idList.every((x) => typeof x === "string")).toBe(true);
    expect(idList.every((x) => x.length === 7)).toBe(true);
  });
  it("should match the expected result", () => {
    expect(idList).toMatchSnapshot();
  });
});

describe("createIdList from KdB alt data", () => {
  const fileContent = readFileSync("tests/kdb-alt.csv", "utf-8");
  const idList = createIdList(fileContent, true);
  it("should return an array", () => {
    expect(Array.isArray(idList)).toBe(true);
  });
  it("should return an valid array", () => {
    expect(idList.every((x) => typeof x === "string")).toBe(true);
    expect(idList.every((x) => x.length === 7)).toBe(true);
  });
  it("should match the expected result", () => {
    expect(idList).toMatchSnapshot();
  });
});

describe("parseCSV", () => {
  const idList = [
    "GC55301",
    "GC51401",
    "GC50501",
    "GC41203",
    "GC53401",
    "GC55201",
    "",
  ];
  const ics = `${parseCSV(idList, kdb, true, false)}END:VCALENDAR`;
  it("should return a string", () => {
    expect(typeof ics).toBe("string");
  });
  it("should match the expected result", () => {
    expect(ics).toMatchSnapshot();
  });
});

describe("parseCSV with classroomMap and combineSameClasses", () => {
  it("should override the classroom when classroomMap is provided", () => {
    const ics = parseCSV(
      ["GC22201"],
      kdb,
      false,
      false,
      { GC22201: "TEST_ROOM" },
    );

    expect(ics).toContain("LOCATION:TEST_ROOM");
    expect(ics).toContain("DTSTART;TZID=Asia/Tokyo:20260416T084000");
  });

  it("should combine consecutive periods into a single event", () => {
    const ics = parseCSV(
      ["GC22201"],
      kdb,
      false,
      true,
      { GC22201: "TEST_ROOM" },
    );

    expect(ics).toContain("DTEND;TZID=Asia/Tokyo:20260416T112500");
    expect(ics).toContain("LOCATION:TEST_ROOM");
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(1);
  });
});
