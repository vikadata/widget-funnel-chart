import { IConfig } from "index";
import { isEqual } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MyResponsiveFunnel } from "./funnel";
import { Alert, IconButton, Tooltip, Box, useThemeColors } from "@apitable/components";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  LockNonzeroOutlined,
  LockFilled,
} from "@apitable/icons";
import {
  useCloudStorage,
  useRecords,
  useSelection,
  useViewport,
  t,
  useMeta,
  RuntimeEnv
} from "@apitable/widget-sdk";
import { Popconfirm } from "antd";
import { ChartPanel } from "./styled";
import { getNumFields, Strings } from "../utils";
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
  const { viewId, filter, dimensionFieldIds, selection, freeze } = config;
  const { runtimeEnv } = useMeta();
  const { isFullscreen } = useViewport();
  const currSelection = useSelection();
  const recordQuery = useMemo(() => ({ filter }), [filter]);
  const allRecords = useRecords(viewId, recordQuery);
  const [isMulti, _setIsMulti] = useCloudStorage("isMulti", false);

  const setIsMulti = useCallback(
    (isMulti) => {
      if (!editable) return;
      return _setIsMulti(isMulti);
    },
    [editable, _setIsMulti]
  );
  const colors = useThemeColors()
  // Define the recordindex and selection state on the individual
  const [individualSelection, setIndividualSelection] = useCloudStorage("individualSelection", currSelection);
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

  // If there is no "lock" and seleted cells is highlight, the selected records are used as the initialization data
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
  }, [recordIdsInSelectionStr, freeze]);

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
    filter
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
      content: t(Strings.at_least_one_digital_field),
    });
  }

  if (!dimensionFieldIds.length) {
    return defaultEmptyContent({ content: t(Strings.select_one_or_multi_fields) });
  }

  if (!records.length) {
    return defaultEmptyContent({ content: t(Strings.select_one_or_multi_records) });
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
                <span style={{ color: colors.fc3 }}>{t(Strings.data_source)}</span>
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
                  {recordsLength <= 1 ? "" : `${t(Strings.more_record)} ${recordsLength} ${t(Strings.records_count)}`}
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
                runtimeEnv == RuntimeEnv.Mobile || prevDisable ? (
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
                  <Tooltip content={t(Strings.previous_record)} trigger="hover">
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
                runtimeEnv == RuntimeEnv.Mobile || nextDisable ? (
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
                  <Tooltip content={t(Strings.next_record)} trigger="hover">
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
                    <span style={{color: colors.fc1}}>{t(Strings.unlock_tips)}</span>
                  ) : (
                    <span style={{color: colors.fc1}}>
                      {t(Strings.lock_tips)}
                    </span>
                  )
                }
                onConfirm={lockCurrentRecord}
                okText={t(Strings.lock_confirm)}
                cancelText={t(Strings.lock_cancel)}
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
