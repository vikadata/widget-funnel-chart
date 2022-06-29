import { IConfig } from "index";
import { isEqual } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MyResponsiveFunnel } from "./funnel";
import { Alert, IconButton, Tooltip, Box, useThemeColors } from "@vikadata/components";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  LockNonzeroOutlined,
  LockFilled,
} from "@vikadata/icons";
import {
  useCloudStorage,
  useRecords,
  useSelection,
  useViewport,
} from "@vikadata/widget-sdk";
import { Modal, Popconfirm, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ChartPanel } from "./styled";
import { getNumFields } from "../utils";
import { defaultEmptyContent } from "./empty_content";

interface IViewProps {
  config: IConfig;
  setConfig: Function;
  editable: boolean;
}

const getRecordIndex = (allRecords, selection, individualSelection, freeze) => {
  const firstRecord = freeze
    ? selection?.recordIds[0]
    : individualSelection?.recordIds[0];
  return (
    allRecords.findIndex((record) => {
      return firstRecord === record.recordId;
    }) || 0
  );
};

export const View: React.FC<IViewProps> = (props) => {
  const { config, setConfig, editable } = props;
  const { viewId, dimensionFieldIds, selection, freeze } = config;

  const { isFullscreen } = useViewport();
  const currSelection = useSelection();
  const allRecords = useRecords(viewId);
  const [isMulti, _setIsMulti] = useCloudStorage("isMulti", false);
  const setIsMulti = useCallback(
    (isMulti) => {
      if (!editable) return;
      return _setIsMulti(isMulti);
    },
    [editable, _setIsMulti]
  );
  const colors = useThemeColors()
  console.log('@@',colors)
  // 定义个人本地上的 recordIndex 和 selection state
  const [individualSelection, setIndividualSelection] = useState(currSelection);
  const [recordsLength, setRecordsLength] = useState(
    selection?.recordIds.length || 0
  );
  const newIndex = getRecordIndex(
    allRecords,
    selection,
    individualSelection,
    freeze
  );
  const [currentRecordIndex, setCurrentRecordIndex] = useState(newIndex);

  const lockCurrentRecord = () => {
    // if (!individualSelection) return;
    if (!freeze && individualSelection?.recordIds.length) {
      return setConfig({
        ...config,
        selection: individualSelection,
        freeze: !config.freeze,
      });
    }
    setConfig({
      ...config,
      freeze: !config.freeze,
    });
  };

  const recordIdsInConfigSelectionStr = selection?.recordIds.join(",");

  const recordIdsInSelectionStr = currSelection?.recordIds.join(",");

  useEffect(() => {
    if (freeze && recordIdsInConfigSelectionStr) {
      setIndividualSelection(selection);
    }
  }, [recordIdsInConfigSelectionStr, freeze]);

  // 如果没有开启“锁定”，并且有单元格选区高亮，则使用选区内的记录作为初始化数据
  useEffect(() => {
    const newRecordIndex = getRecordIndex(
      allRecords,
      selection,
      currSelection,
      freeze
    );
    if (!freeze && recordIdsInSelectionStr) {
      setIndividualSelection(currSelection);
      setIsMulti(true);
      setCurrentRecordIndex(newRecordIndex);
    }

    if (allRecords.length > 0) {
      setCurrentRecordIndex(newRecordIndex);
    }
  }, [recordIdsInSelectionStr, freeze, allRecords]);

  const changeCurrentRecordIndex = () => {
    if (
      !freeze &&
      !isEqual(individualSelection, selection) &&
      individualSelection
    ) {
      setIsMulti(true);
      const newRecordIndex = getRecordIndex(
        allRecords,
        selection,
        individualSelection,
        freeze
      );
      setCurrentRecordIndex(newRecordIndex);
    }
  };

  useEffect(() => {
    if (records.length === 1) {
      setIndividualSelection({
        fieldIds: currSelection?.fieldIds ? currSelection.fieldIds : [],
        recordIds: [singleRecord[0]?.recordId],
      });
    }
  }, [currentRecordIndex]);

  const multiRecords = useRecords(viewId, {
    ids: individualSelection?.recordIds,
  });

  const singleRecord = allRecords.length
    ? currentRecordIndex >= 0 && currentRecordIndex < allRecords.length
      ? [allRecords[currentRecordIndex]]
      : [allRecords[0]]
    : [];

  const records =
    isMulti && multiRecords.length > 1 ? multiRecords : singleRecord;

  const prevDisable = currentRecordIndex <= 0;
  const nextDisable = currentRecordIndex >= allRecords.length - 1;

  useEffect(() => {
    setRecordsLength(records.length);
  }, [records.length]);

  const data = useMemo(
    () =>
      dimensionFieldIds
        .map((dimensionFieldId, index) => {
          return {
            id: dimensionFieldId + index,
            value: records.reduce(
              (partialSum, a) => partialSum + a.getCellValue(dimensionFieldId),
              0
            ),
            label: dimensionFieldId,
          };
        })
        .filter((dimensionData) => typeof dimensionData.value === "number"),
    [records, dimensionFieldIds]
  );

  const rate = useMemo(() => {
    const rate: (number | undefined)[] = [];
    for (let i = 0; i < data.length - 1; i++) {
      rate.push(data[i + 1].value / data[i].value);
    }
    return rate;
  }, [data]);

  if (!getNumFields(viewId).length) {
    return defaultEmptyContent({
      content: "至少需要一个数字字段作为维度，才能渲染漏斗图",
    });
  }

  if (!dimensionFieldIds.length) {
    return defaultEmptyContent({ content: "请选择一个或多个维度" });
  }

  if (!records.length) {
    return defaultEmptyContent({ content: "请选择一条或多条记录" });
  }

  return (
    <ChartPanel colors={colors}>
      <div className={"viewTitle"}>
        <Box
          width="100%"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          overflow="auto"
        >
          <Box minWidth="70%" display="flex" overflow="auto">
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              style={{
                fontSize: "12px",
                margin: "auto 0",
                width: "100%",
              }}
            >
              <Box
                maxWidth="80%"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: colors.fc1
                }}
              >
                <span style={{ color: colors.fc3 }}>数据来源：</span>
                {records[0].title}
              </Box>
              <Box
                maxWidth="20%"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  
                }}
              >
                <span style={{color: colors.fc1}}>
                  {recordsLength <= 1 ? "" : `等 ${recordsLength} 条记录`}
                </span>
              </Box>
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            width="82px"
            style={{
              justifyContent: "flex-end",
            }}
          >
            <Box>
              {!freeze ? (
                prevDisable ? (
                  <IconButton
                    icon={ArrowUpOutlined}
                    component="button"
                    size="small"
                    disabled={prevDisable}
                    onClick={() => {
                      if (prevDisable) return;
                      changeCurrentRecordIndex();
                      setCurrentRecordIndex(currentRecordIndex - 1);
                      setIsMulti(false);
                    }}
                  />
                ) : (
                  <Tooltip content="上一个" trigger="hover">
                    <span>
                      <IconButton
                        style={{color:colors.thirdLevelText}}
                        icon={ArrowUpOutlined}
                        component="button"
                        size="small"
                        disabled={prevDisable}
                        onClick={() => {
                          if (prevDisable) return;
                          changeCurrentRecordIndex();
                          setCurrentRecordIndex(currentRecordIndex - 1);
                          setIsMulti(false);
                        }}
                      />
                    </span>
                  </Tooltip>
                )
              ) : null}
            </Box>
            <Box>
              {!freeze ? (
                nextDisable ? (
                  <IconButton
                    icon={ArrowDownOutlined}
                    component="button"
                    size="small"
                    disabled={nextDisable}
                    onClick={() => {
                      if (nextDisable) return;
                      changeCurrentRecordIndex();
                      setCurrentRecordIndex(currentRecordIndex + 1);
                      setIsMulti(false);
                    }}
                  />
                ) : (
                  <Tooltip content="下一个" trigger="hover">
                    <span>
                      <IconButton
                        style={{color:colors.thirdLevelText}}
                        icon={ArrowDownOutlined}
                        component="button"
                        size="small"
                        disabled={nextDisable}
                        onClick={() => {
                          if (nextDisable) return;
                          changeCurrentRecordIndex();
                          setCurrentRecordIndex(currentRecordIndex + 1);
                          setIsMulti(false);
                        }}
                      />
                    </span>
                  </Tooltip>
                )
              ) : null}
            </Box>
            <Box>
              <div
                style={{
                  float: "left",
                  width: "1px",
                  height: "16px",
                  background: colors.lineColor,
                  margin: "4px",
                }}
              ></div>
            </Box>
            <Box>
              <Popconfirm
                title={
                  freeze ? (
                    <span style={{color: colors.fc1}}>取消锁定后，当前漏斗图仅在本地渲染</span>
                  ) : (
                    <span style={{color: colors.fc1}}>
                      开启锁定后，当前漏斗图将固定下来，
                      <br />
                      不再跟随鼠标移动或切换记录而更新图形
                    </span>
                  )
                }
                onConfirm={lockCurrentRecord}
                okText="确认"
                cancelText="取消"
                placement="leftTop"
                disabled={!editable}
                color={colors.defaultBg}
              >
                <IconButton
                  style={{color:colors.thirdLevelText}}
                  icon={freeze ? LockFilled : LockNonzeroOutlined}
                  size="small"
                  disabled={!editable}
                />
              </Popconfirm>
            </Box>
          </Box>
        </Box>
      </div>
      <div className={"viewContent"}>
        <div className="rate">
          {isFullscreen &&
            rate.map((r) => {
              if (r === Infinity) return <div>0</div>;
              return (
                <div style={{ fontSize: "12px" }}>
                  {(r * 100).toFixed(2) + "%"}
                </div>
              );
            })}
        </div>
        <div className="rect">
          <MyResponsiveFunnel data={data} />
        </div>
      </div>
    </ChartPanel>
  );
};
