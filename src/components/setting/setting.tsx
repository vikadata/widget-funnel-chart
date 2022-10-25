import { IConfig } from "index";
import React, { useEffect, useMemo, useState } from "react";
import {
  useActiveViewId,
  useDatasheet,
  useFields,
  useMeta,
  useSettingsButton,
  useViewIds,
  RuntimeEnv
} from "@vikadata/widget-sdk";

import { Box, Typography, Button, Alert, Tooltip, useThemeColors } from "@vikadata/components";
import { AddOutlined, InformationSmallOutlined } from "@vikadata/icons";
import { FieldItem } from "./fieldItem/fieldItem";
import { SettingPanel } from "./styled";
import { getNumFields } from "../utils";



const FormItem = ({ label, colors, children }) => {
  return (
    <Box>
      <Typography style={{ fontSize: "12px", color: colors.fc3 }}>
        {label}
      </Typography>
      <div style={{ width: "100%" }}>{children}</div>
    </Box>
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

  const { installPosition, runtimeEnv } = useMeta(); // 获取小程序安装位置、运行环境
  const colors = useThemeColors()


  const activeViewId =
    installPosition === "WidgetPanel" ? useActiveViewId() : useViewIds()[0];
  const allFields = useFields(viewId);
  const number_fields = getNumFields(viewId);
  const number_fieldIds = number_fields.map((field) => field.id);
  // 新增/修改/删除 数字列时，同步修改 dimensionFieldIds
  const currDimensionFieldIds = dimensionFieldIds.filter((dimensionFieldId) =>
    number_fieldIds.includes(dimensionFieldId)
  );

  const currDimensionFieldIdsStr = currDimensionFieldIds.join(",");

  // TODO: 后续通过控制维度配置面板（filter）来被动更新 dimensionField
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
      console.error("没有找到空位");
      return;
    }
    dimensionFieldIds.push(number_fields[first_one].id);
    setConfig(config);
  };

  // TODO: 后续加上 i18n
  return (
    <SettingPanel openSetting={runtimeEnv == RuntimeEnv.Desktop && 
    isSettingOpened} readOnly={!editable} colors={colors}>
      <div style={{ display: "flex", paddingBottom: "6px" }}>
        <Typography style={{ fontSize: "16px" }}>漏斗图配置</Typography>
        <Tooltip content="配置教程" placement="top-end">
          <div style={{ display: "flex", marginLeft: "4px", marginTop: "3px" }}>
            <a
              className={"linkToDocs"}
              href="https://help.vika.cn/docs/guide/intro-widget-funnel-chart"
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
        <Typography style={{ fontSize: "14px" }}>功能配置</Typography>
      </div>

      <FormItem label={`选择维度(${dimensionFieldIds.length}/10)`} colors={colors}>
        {Array.from(dimensionFieldIds, (v: string, i) => {
          return (
            <FieldItem config={config} setConfig={setConfig} i={i} v={v} />
          );
        })}
        {dimensionFieldIds.length >= maxDimensionNum ? (
          <Alert
            content="最多只能添加 10 个维度"
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
          添加维度
        </Button>
      </FormItem>
    </SettingPanel>
  );
};
