import { Field, FieldType, useFields } from "@vikadata/widget-sdk";
import { isEqual } from "lodash";

export interface IIsMultiProps {
  freeze: boolean;
  currSelection: undefined | { recordIds: string[]; fieldIds: string[] };
  selection: undefined | { recordIds: string[]; fieldIds: string[] };
  currentRecordIndex: number;
}

// 判断是否多选记录
export const isMulti = (props: IIsMultiProps) => {
  const { freeze, currSelection, selection } = props;
  // 根据 index 判断要不要变成 single
  if (!freeze && !isEqual(currSelection, selection) && currSelection) {
    return true;
  }
  return false;
};

export const sum = (records, number_field) => {
  return records.reduce(
    (partialSum, a) => partialSum + a.getCellValue(number_field.fieldData.id),
    0
  );
};

// TODO: 目前 IConfig 已经去掉 fieldsMap，等排序功能开发后修改此函数
export function sortByValue(fieldsMap, records, number_fields, reverse) {
  fieldsMap.sort(
    (x, y) => sum(records, number_fields[x]) - sum(records, number_fields[y])
  );
  if (reverse) {
    fieldsMap.reverse();
  }
  return fieldsMap;
}

export const numberFieldsFilter = (dimensionFields: Field[]) => {
  return dimensionFields.filter((f) => f.type === "Number").map((f) => f.id);
};

// 获取数字类型的列
export const getNumFields = (viewId) => {
  const allFields = useFields(viewId);
  const number_fields = allFields.filter(
    (f) =>
      f.basicValueType === "Number" &&
      !["Currency", "Percent", "Rating", "AutoNumber"].includes(f.type)
  );
  return number_fields;
};
