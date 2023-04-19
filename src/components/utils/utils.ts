import { Field, FieldType, useFields } from "@apitable/widget-sdk";
import { isEqual } from "lodash";

export interface IIsMultiProps {
  freeze: boolean;
  currSelection: undefined | { recordIds: string[]; fieldIds: string[] };
  selection: undefined | { recordIds: string[]; fieldIds: string[] };
  currentRecordIndex: number;
}

// Determine whether to choose multiple records
export const isMulti = (props: IIsMultiProps) => {
  const { freeze, currSelection, selection } = props;
  // Based on index judgment, do you want to become single
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

// TODO: At present IConfig has removed fieldsMap, and after the development of the sorting function is developed, modify this function
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

// Get the fields of numbers
export const getNumFields = (viewId) => {
  const allFields = useFields(viewId);
  const number_fields = allFields.filter(
    (f) =>
      f.basicValueType === "Number" &&
      !["Percent", "Rating", "AutoNumber"].includes(f.type)
  );
  return number_fields;
};
