import { IConfig } from "index";
import React, { useEffect, useMemo } from "react";
import {
  useActiveViewId,
  useMeta,
  useSettingsButton,
  useViewIds,
  t,
  RuntimeEnv
} from "@apitable/widget-sdk";

import { Typography, Button, Alert, Tooltip, useThemeColors } from "@apitable/components";
import { AddOutlined, InformationSmallOutlined } from "@apitable/icons";
import { FieldItem } from "./fieldItem/fieldItem";
import { SettingPanel } from "./styled";
import { getNumFields, Strings } from "../utils";
import { FilterSelect } from "./filter_select";



const FormItem = ({ label, colors, children }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Typography style={{ fontSize: "12px", color: colors.fc3 }}>
        {label}
      </Typography>
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
};

interface ISettingProps {
  config: IConfig;
  setConfig: Function;
  editable: boolean;
}

const maxDimensionNum = 10;

export const Setting: React.FC<ISettingProps> = (props) => {
  const { config, setConfig, editable } = props;
  const [isSettingOpened] = useSettingsButton();
  const { viewId, dimensionFieldIds } = config;

  const { installPosition, runtimeEnv } = useMeta(); // Get the installation location and operating environment of the widget
  const colors = useThemeColors()

  const activeViewId =
    installPosition === "WidgetPanel" ? useActiveViewId() : useViewIds()[0];
  const number_fields = getNumFields(viewId);
  const number_fieldIds = number_fields.map((field) => field.id);
  // When create/update/delete the number field, modify the demensionFieldIds synchronous modification
  const currDimensionFieldIds = dimensionFieldIds.filter((dimensionFieldId) =>
    number_fieldIds.includes(dimensionFieldId)
  );

  const currDimensionFieldIdsStr = currDimensionFieldIds.join(",");

  // TODO: Passive update of dimensionField through the control dimension configuration panel (Filter)
  useMemo(() => {
    setConfig({ ...config, dimensionFieldIds: currDimensionFieldIds });
  }, [currDimensionFieldIdsStr]);

  useEffect(() => {
    setConfig({ ...config, viewId: activeViewId });
  }, [activeViewId]);

  const fields: Record<any, any>[] = [];
  for (const dimensionFieldIdElement of dimensionFieldIds) {
    fields.push(number_fields[dimensionFieldIdElement]);
  }

  const add = () => {
    if (dimensionFieldIds.length >= maxDimensionNum) {
      return;
    }
    let first_one = -1;

    for (let i = 0; i < number_fields.length; i++) {
      if (dimensionFieldIds.findIndex((value, index) => index === i) >= 0)
        continue;
      first_one = i;
      break;
    }
    if (first_one === -1) {
      console.error("No empty position");
      return;
    }
    let tempDimensionFieldIds = [...dimensionFieldIds]
    tempDimensionFieldIds.push(number_fields[first_one].id);
    setConfig({ ...config, dimensionFieldIds: tempDimensionFieldIds });
  };

  return (
    <SettingPanel openSetting={runtimeEnv == RuntimeEnv.Desktop && 
    isSettingOpened} readOnly={!editable} colors={colors}>
      <div style={{ display: "flex", paddingBottom: "6px" }}>
        <Typography style={{ fontSize: "16px" }}>{t(Strings.settings)}</Typography>
        <Tooltip content={t(Strings.settings_tutorial)} placement="top-end">
          <div style={{ display: "flex", marginLeft: "4px", marginTop: "3px" }}>
            <a
              className={"linkToDocs"}
              href="https://help.apitable.com/docs/guide/intro-widget-funnel-chart/"
              target="_blank"
            >
              <InformationSmallOutlined></InformationSmallOutlined>
            </a>
          </div>
        </Tooltip>
      </div>
      <div
        style={{ display: "flex", paddingBottom: "16px", paddingTop: "6px" }}
      >
        <Typography style={{ fontSize: "14px" }}>{t(Strings.function_settings)}</Typography>
      </div>

      <FormItem label={`${t(Strings.filter)}`} colors={colors}>
        <FilterSelect 
          value={config.filter}
          onChange={(filter) => setConfig({ ...config, filter })}
        />
      </FormItem>

      <FormItem label={`${t(Strings.select_dimensions)}(${dimensionFieldIds.length}/10)`} colors={colors}>
        {Array.from(dimensionFieldIds, (v: string, i) => {
          return (
            <FieldItem config={config} setConfig={setConfig} i={i} v={v} />
          );
        })}
        {dimensionFieldIds.length >= maxDimensionNum ? (
          <Alert
            content={t(Strings.max_dimensions_tips)}
            onClose={function noRefCheck() {}}
            type={"error"}
            style={{ marginBottom: "8px" }}
          />
        ) : null}
        <Button
          style={{ marginTop: "8px" }}
          prefixIcon={<AddOutlined />}
          onClick={add}
        >
          {t(Strings.add_a_dimension)}
        </Button>
      </FormItem>
    </SettingPanel>
  );
};
