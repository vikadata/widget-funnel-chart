import styled, { css } from "styled-components";

export const SettingPanel = styled.div<{
  openSetting: boolean;
  readOnly: boolean;
}>`
  flex-shrink: 0;
  width: 320px;
  border-left: solid 1px ${(props) => (props.colors.lineColor)};
  padding: 16px;
  background-color: ${(props) => (props.colors.defaultBg)};
  overflow: auto;
  display: ${(props) => (props.openSetting ? "block" : "none")};
  ${(props) => {
    if (props.readOnly) {
      return css`
        pointer-events: none;
        opacity: 0.5;
      `;
    }
    return;
  }}
`;
