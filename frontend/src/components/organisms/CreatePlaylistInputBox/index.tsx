import { ChangeEventHandler, PropsWithChildren } from 'react';

import styled from '@emotion/styled';

import InputText from '../../atoms/InputText';

interface Props {
  setTitle: ChangeEventHandler;
  setDescription: ChangeEventHandler;
  setHashTag: ChangeEventHandler;
  title: string;
  description: string;
  hashTag: string;
}

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  @media (max-width: 1200px) {
    & > div > :last-child {
      height: 40px;
      padding-left: 30px;
    }
  }
  @media (max-width: 768px) {
    & > div > :last-child {
      height: 40px;
      padding-left: 20px;
    }
  }
  @media (max-width: 480px) {
    & > div > :last-child {
      height: 35px;
      padding-left: 10px;
    }
  }
`;
const Label = styled.label`
  font-size: 1em;
  font-weight: bold;
`;
const PlaylistInputText = styled(InputText)`
  width: 98%;
  height: 3em;
  padding: 25px 10px 25px 45px;
  @media (max-width: 1200px) {
    padding: 25px 10px 25px 45px;
  }
  @media (max-width: 768px) {
    padding: 20px 10px 20px 35px;
  }
  @media (max-width: 480px) {
    padding: 15px 10px 15px 20px;
  }
`;

const CreatePlaylistInputBox = ({
  setTitle,
  setDescription,
  setHashTag,
  title,
  description,
  hashTag,
}: PropsWithChildren<Props>) => {
  return (
    <InputContainer>
      <Label>플레이리스트 제목</Label>
      <PlaylistInputText
        changeHandler={setTitle}
        value={title}
        className="title"
        isSearch={false}
        placeholder="플레이리스트 제목을 입력해주세요."
      ></PlaylistInputText>
      <Label>플레이리스트 설명</Label>
      <PlaylistInputText
        changeHandler={setDescription}
        value={description}
        className="description"
        isSearch={false}
        placeholder="플레이리스트 설명을 입력해주세요."
      ></PlaylistInputText>
      <Label>플레이리스트 해시태그</Label>
      <PlaylistInputText
        changeHandler={setHashTag}
        value={hashTag}
        className="hashTag"
        isSearch={false}
        placeholder="추가할 해시태그를 입력 후 Enter를 클릭하세요."
      ></PlaylistInputText>
    </InputContainer>
  );
};

export default CreatePlaylistInputBox;
