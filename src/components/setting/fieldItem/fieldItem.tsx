import { IconButton, Select, useThemeColors } from "@apitable/components";
import { DeleteOutlined } from "@apitable/icons";
import { useSettingsButton } from "@apitable/widget-sdk";
import { getNumFields } from "../../utils";
import { IConfig } from "index";
import React from "react";
import { IconWrap } from "./styled";

interface IFieldItem {
  i: number;
  v: string;
  config: IConfig;
  setConfig: Function;
}

export const FieldItem: React.FC<IFieldItem> = (props) => {
  const [isSettingOpened] = useSettingsButton();
  const { i, v, config, setConfig } = props; // The "i" is an index in dimensionFieldids, the "v" is the value of dimensionFieldids
  const { dimensionFieldIds, viewId } = config;
  const colors = useThemeColors()
  const number_fields = getNumFields(viewId);

  const changeHandler = (option) => {
    let tempDimensionFieldIds = [...dimensionFieldIds]
    tempDimensionFieldIds.splice(i, 1, option.value);
    // // TODO: Subsequent sorting function development modify this function
    // switch (mode) {
    //   case "2":
    //     config.dimensionFieldIds = sortByValue(
    //       dimensionFieldIds,
    //       records,
    //       number_fields,
    //       false
    //     );
    //     break;
    //   case "3":
    //     config.dimensionFieldIds = sortByValue(
    //       dimensionFieldIds,
    //       records,
    //       number_fields,
    //       true
    //     );
    //     break;
    // }
    setConfig({ ...config, dimensionFieldIds: tempDimensionFieldIds });
  };

  return isSettingOpened ? (
    <div style={{ display: "flex", marginTop: "8px" }} key={i + 1}>
      <Select
        value={v}
        onSelected={(option) => {
          changeHandler(option);
        }}
        dropdownMatchSelectWidth={false}
        triggerStyle={{ width: "100%" }}
      >
        {number_fields.map((option, index) => {
          return (
            <Select.Option
              tabIndex={index} // tabindex is the index of num_fields
              value={option.id} // Dimension (field ID)
              currentIndex={index}
            >
              {option.name}
            </Select.Option>
          );
        })}
      </Select>
      <IconWrap>
        <IconButton
          style={{color:colors.thirdLevelText}}
          icon={DeleteOutlined}
          size="small"
          className={"dragHandler"}
          onClick={() => {
            let tempDimensionFieldIds = [...config.dimensionFieldIds]
            tempDimensionFieldIds.splice(i, 1);
            setConfig({ ...config, dimensionFieldIds: tempDimensionFieldIds });
          }}
        />
      </IconWrap>
    </div>
  ) : null;
};
