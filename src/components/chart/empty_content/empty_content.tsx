import React from "react";
import { black, useThemeColors } from "@apitable/components";
interface EmptyContentProps {
  content: string;
}

export function defaultEmptyContent(props: EmptyContentProps) {
  const { content } = props;
  const colors = useThemeColors()
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.defaultBg,
      }}
    >
      <img
        alt="empty-image"
        src="https://legacy-s1.apitable.com/space/2022/02/16/7f9dca59465c4ac8be91dbbf1ab4abad"
        style={{
          width: 160,
          height: 120,
        }}
      />
      <div
        style={{
          marginTop: 8,
          lineHeight: 1.5,
          color: colors.fc1,
        }}
      >
        {content}
      </div>
    </div>
  );
}
