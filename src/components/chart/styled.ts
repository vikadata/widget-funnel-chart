import styled from "styled-components";

export const ChartPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  width: 100%;
  height: 100%;
  padding: 16px;
  padding-right: 2px;
  background-color: ${(props) => (props.colors.defaultBg)};
  .viewTitle {
    display: flex;
    flex-direction: row;
    width: 100%;
  }
  .viewTitle .viewSource {
    display: flex;
    flex-direction: row;
    flex: 2;
    width: 100%;
  }
  .viewTitle .viewIconButton {
    display: flex;
    flex-direction: row;
    flex: 1;
    justify-content: flex-end;
    width: 100%;
  }
  .viewContent {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
  }
  .viewContent .rate {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: flex-end;
    margin-top: 20px;
    margin-bottom: 20px;
    color: ${(props) => (props.colors.fc1)};
  }
  .viewContent .rect {
    display: flex;
    width: 100%;
  }
`;
