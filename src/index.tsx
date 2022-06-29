import React, { useCallback } from "react";
import {
  initializeWidget,
  useSelection,
  useCloudStorage,
  useActiveViewId,
  useFields,
  useMeta,
  useViewIds,
  useDatasheet,
  FieldType,
  useSettingsButton,
} from "@vikadata/widget-sdk";
import { ThemeProvider, useThemeColors } from "@vikadata/components";
import { Setting } from "./components/setting/setting";
import { View } from "./components/chart/chart";
import "antd/dist/antd.css";
import { getNumFields } from "./components/utils";

export enum SortType {
  None = "none",
  Asc = "asc",
  Desc = "desc",
}

export interface IConfig {
  viewId: string | undefined;
  freeze: boolean;
  dimensionFieldIds: string[];
  sortType: SortType;
  currentRecordIndex: number;
  selection?: undefined | { recordIds: string[]; fieldIds: string[] };
}

// 初始化配置
export const useGetDefaultConfig = () => {
  const { installPosition } = useMeta(); // 获取小程序安装位置

  const defaultViewId =
    installPosition === "WidgetPanel" ? useActiveViewId() : useViewIds()[0];
  const selection = useSelection();
  const dimensionField = getNumFields(defaultViewId);
  const dimensionFieldIds = dimensionField.map((f) => f.id); // 获取 defaultViewId 下所有「数字」列的 id
  const defaultDimensionFieldIdsLengthMax = 5;
  const defaultDimensionFieldIds =
    dimensionFieldIds.length <= defaultDimensionFieldIdsLengthMax
      ? dimensionFieldIds
      : dimensionFieldIds.slice(0, defaultDimensionFieldIdsLengthMax);

  return useCallback(() => {
    return {
      viewId: defaultViewId, // 视图的ID
      freeze: false, // 是否锁定
      dimensionFieldIds: defaultDimensionFieldIds, // 所选字段对应的 id
      sortType: SortType.None, // 排序模式，默认是 None
      currentRecordIndex: 0, // 当前所选记录的索引
      selection: selection, // 当前选区
    };
  }, []);
};

export const App: React.FC = () => {
  const { theme } = useMeta(); // 获取小程序主题模式
  const colors = useThemeColors()
  const defaultConfig = useGetDefaultConfig();
  const [isSettingOpened] = useSettingsButton();
  const [config, _setConfig, editable] = useCloudStorage(
    "defaultConfig",
    defaultConfig
  );

  // 初始化时判断权限
  const setConfig = useCallback(
    (config) => {
      if (!editable) return;
      return _setConfig(config);
    },
    [editable, _setConfig]
  );

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          display: "flex",
          height: "100%",
          borderTop: isSettingOpened ? `solid 1px ${colors.lineColor}` : undefined,
        }}
      >
        <View config={config} setConfig={setConfig} editable={editable} />
        <Setting config={config} setConfig={setConfig} editable={editable} />
      </div>
    </ThemeProvider>
  );
};

initializeWidget(App, process.env.WIDGET_PACKAGE_ID);
