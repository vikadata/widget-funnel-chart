import React, { useCallback } from "react";
import {
  initializeWidget,
  useSelection,
  useCloudStorage,
  useActiveViewId,
  useMeta,
  useViewIds,
  useSettingsButton,
} from "@apitable/widget-sdk";
import { ThemeProvider, useThemeColors } from "@apitable/components";
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
  filter: string | null;
  freeze: boolean;
  dimensionFieldIds: string[];
  sortType: SortType;
  currentRecordIndex: number;
  selection?: undefined | { recordIds: string[]; fieldIds: string[] };
}

// Initial configuration
export const useGetDefaultConfig = () => {
  const { installPosition } = useMeta(); // Get the widget installation location

  const defaultViewId =
    installPosition === "WidgetPanel" ? useActiveViewId() : useViewIds()[0];
  const selection = useSelection();
  const dimensionField = getNumFields(defaultViewId);
  const dimensionFieldIds = dimensionField.map((f) => f.id); // Get all the ID of all number fields under defaultViewid
  const defaultDimensionFieldIdsLengthMax = 5;
  const defaultDimensionFieldIds =
    dimensionFieldIds.length <= defaultDimensionFieldIdsLengthMax
      ? dimensionFieldIds
      : dimensionFieldIds.slice(0, defaultDimensionFieldIdsLengthMax);

  return useCallback(() => {
    return {
      viewId: defaultViewId, // View ID
      filter: null,
      freeze: false, // whether to lock
      dimensionFieldIds: defaultDimensionFieldIds, // The selected field's ID
      sortType: SortType.None, // Sorting mode, default is None
      currentRecordIndex: 0, // The index of the currently selected record
      selection: selection, // Current Selection
    };
  }, []);
};

export const App: React.FC = () => {
  const { theme } = useMeta(); // Get the theme mode of the widget
  const colors = useThemeColors()
  const defaultConfig = useGetDefaultConfig();
  const [isSettingOpened] = useSettingsButton();
  const [config, _setConfig, editable] = useCloudStorage(
    "defaultConfig",
    defaultConfig
  );

  // Judging permissions during initialization
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
