import { IconButton, Select, useThemeColors } from "@vikadata/components";
import { DeleteOutlined } from "@vikadata/icons";
import { useFields, useRecords, useSettingsButton } from "@vikadata/widget-sdk";
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
  const { i, v, config, setConfig } = props; // i为 dimensionFieldIds 里的索引， v为 dimensionFieldIds 的值
  const { dimensionFieldIds, viewId } = config;
  const allFields = useFields(viewId);
  const colors = useThemeColors()
  const number_fields = getNumFields(viewId);

  const changeHandler = (option) => {
    dimensionFieldIds.splice(i, 1, option.value);
    // // TODO: 后续排序功能开发修改此函数
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

    setConfig(config);
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
              tabIndex={index} // tabIndex 为num_fields的索引
              value={option.id} // 维度（字段 id）
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
            config.dimensionFieldIds.splice(i, 1);
            setConfig({ ...config, dimensionFieldIds });
          }}
        />
      </IconWrap>
    </div>
  ) : null;
};
