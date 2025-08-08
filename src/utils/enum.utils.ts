const extractEnumValues = <T extends { [key: string]: string | number | boolean }>(
  data: T,
  exclude?: string[],
): string[] | number[] | boolean[] => {
  if (exclude && exclude.length) {
    return Object.values(data).filter((val) => !exclude.includes(val as string)) as string[] | number[] | boolean[];
  }
  return Object.values(data) as string[] | number[] | boolean[];
};

const EnumUtils = { extractEnumValues };
export default EnumUtils;
