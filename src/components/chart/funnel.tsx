import { FunnelPart, ResponsiveFunnel } from "@nivo/funnel";
import React from "react";
import { useSpring, animated } from "react-spring";
import { useTheme, useMotionConfig } from "@nivo/core";
import { useField, useMeta } from "@vikadata/widget-sdk";

import { BasicTooltip } from "@nivo/tooltip";

export interface FunnelDatum {
  id: string | number;
  value: number;
  label?: string;
}

export interface FunnelPartWithHandlers<D extends FunnelDatum>
  extends FunnelPart<D> {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseMove?: () => void;
  onClick?: () => void;
}
export interface PartTooltipProps<D extends FunnelDatum> {
  part: FunnelPartWithHandlers<D>;
}

export const PartTooltip = <D extends FunnelDatum>({
  part,
}: PartTooltipProps<D>) => {
  const dataName = useField(part.data.label)?.name;
  return (
    <BasicTooltip
      id={dataName}
      value={part.formattedValue}
      color={part.color}
      enableChip={true}
    />
  );
};

export const PartLabel = ({ part }) => {
  const dataName = useField(part.data.label)?.name;
  const theme = useTheme();
  const { animate, config: motionConfig } = useMotionConfig();
  const result = part.data.value.toFixed(2);
  const animatedProps = useSpring({
    transform: `translate(${part.x}, ${part.y})`,
    color: part.labelColor,
    config: motionConfig,
    immediate: !animate,
  });

  return (
    <animated.g transform={animatedProps.transform}>
      <animated.text
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          ...theme.labels.text,
          fill: animatedProps.color,
          pointerEvents: "none",
        }}
      >
        {dataName}：{result}
      </animated.text>
    </animated.g>
  );
};

function Labels(props) {
  return props.parts.map((part) => (
    <PartLabel key={part.data.id} part={part} />
  ));
}

export const MyResponsiveFunnel = ({ data }) => {
  const { theme } = useMeta()

  return (
    // TODO： 等到后续自定义可以把静态配置项，如 colors、border、labelColor 等，都在一个方法中返回，相当于一份配置，比如叫 staticConfig，这样可以只关注变动的参数
    <div style={{ width: "99%" }}>
      <ResponsiveFunnel
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        layers={["separators", "parts", Labels, "annotations"]}
        tooltip={PartTooltip}
        shapeBlending={0.2}
        valueFormat=" >-.4s"
        colors={{ scheme: "pastel1" }}
        fillOpacity={0.75}
        borderWidth={0}
        borderOpacity={1}
        labelColor={{
          from: "color",
          modifiers:  theme === 'dark' ? [['darker', 3]] : [['darker', 1.4]],
        }}
        enableBeforeSeparators={false}
        beforeSeparatorLength={39}
        beforeSeparatorOffset={20}
        enableAfterSeparators={false}
        afterSeparatorLength={100}
        afterSeparatorOffset={20}
        currentPartSizeExtension={8}
        currentBorderWidth={0}
        animate={false}
        motionConfig="wobbly"
      />
    </div>
  );
};
