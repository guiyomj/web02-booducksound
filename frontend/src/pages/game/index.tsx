import { MutableRefObject, ReactEventHandler, useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { BACKEND_URL } from '~/constants/index';
import { useLeavePage } from '~/hooks/useLeavePage';
import useSocket from '~/hooks/useSocket';
import useSocketEmit from '~/hooks/useSocketEmit';
import useSocketOn from '~/hooks/useSocketOn';
import BlurDialog from '~/molecules/BlurDialog';
import GameRoomContainer from '~/organisms/GameRoomContainer';
import GameRoomNav from '~/organisms/GameRoomNav';
import ResultModal from '~/organisms/ResultModal';
import { RootState } from '~/reducers/index';
import theme from '~/styles/theme';
import { RoomActions } from '~/types/Actions';
import { GameRoom } from '~/types/GameRoom';
import { SocketEvents } from '~/types/SocketEvents';

const Container = styled.div`
  overflow: hidden;
  width: 100%;
  max-width: 1360px;
  height: 100vh;
  margin: 0 auto;
  padding: 4px 32px;

  @media (max-width: ${theme.breakpoints.md}) {
    padding: 4px 8px;
  }
`;

const Game: NextPage = () => {
  const [gameRoom, setGameRoom] = useState<GameRoom>();
  const [dialogMsg, setDialogMsg] = useState<{ title: string; content: string } | null>(null);
  const [gameResultModalOnOff, setGameResultModalOnOff] = useState(false);
  const { uuid } = useSelector((state: RootState) => state.room);
  const userInfo = useSelector((state: RootState) => state.user);
  const socket = useSocket();
  const router = useRouter();
  const dispatch = useDispatch();

  const music1 = useRef<HTMLAudioElement>(null);
  const music2 = useRef<HTMLAudioElement>(null);
  const curMusic: MutableRefObject<HTMLAudioElement | null> = useRef<HTMLAudioElement | null>(null);
  const nextMusic: MutableRefObject<HTMLAudioElement | null> = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // TODO : 닉네임, 부덕이 색깔 등이 설정되어 있지 않으면(로그인 하지 않았다면) 설정 페이지로 보낼 것

    if (!uuid) {
      router.push('/lobby');
    }
  }, []);

  useSocketEmit(
    SocketEvents.JOIN_ROOM,
    uuid,
    userInfo,
    ({ type, message, gameRoom }: { type: string; message: string; gameRoom: GameRoom }) => {
      if (type === 'fail') {
        // TODO : window.alert이 아니라 모달으로 에러 message를 띄우도록 할 것
        router.push('/lobby');
      }

      // TODO : 받아온 gameRoom 데이터에 따라 화면을 렌더링할 것
      setGameRoom(gameRoom);
    },
  );

  useSocketOn(SocketEvents.START_GAME, (gameRoom: GameRoom) => {
    if (!music1.current || !music2.current) throw Error('START_GAME에서 audio Element를 찾을 수 없습니다');

    curMusic.current = music1.current;
    nextMusic.current = music2.current;

    curMusic.current.src = `${BACKEND_URL}/game/${uuid}/init`;
    nextMusic.current.src = `${BACKEND_URL}/game/${uuid}/next`;

    setGameRoom(gameRoom);

    const playPromise = curMusic.current.play();

    playPromise.then(() => {
      curMusic.current?.play();
    });
  });

  useSocketOn(
    SocketEvents.ROUND_END,
    ({ type, info, who }: { type: 'SKIP' | 'ANSWER' | 'TIMEOUT'; info: string; who?: string }) => {
      if (type === 'SKIP') {
        setDialogMsg({ title: `${info}`, content: `모두가 SKIP 하였습니다.` });
        return;
      }

      if (type === 'ANSWER') {
        setDialogMsg({ title: `${info}`, content: `${who}님이 노래를 맞추셨습니다!` });
        return;
      }

      if (type === 'TIMEOUT') {
        setDialogMsg({ title: `${info}`, content: `시간이 초과했습니다.` });
      }
    },
  );

  useSocketOn(SocketEvents.NEXT_ROUND, (isExistNext: boolean) => {
    if (!curMusic.current || !nextMusic.current) throw Error('NEXT_ROUND에서 curMusic, nextMusic을 찾을 수 없습니다');
    setDialogMsg(null);

    const temp = curMusic.current;

    curMusic.current.pause();
    curMusic.current = nextMusic.current;
    nextMusic.current = temp;

    const playPromise = curMusic.current.play();

    playPromise.then(() => {
      curMusic.current?.play();
    });

    if (!isExistNext) return;
    nextMusic.current.src = `${BACKEND_URL}/game/${uuid}/next`;
  });

  useSocketOn(SocketEvents.GAME_END, (gameRoom: GameRoom) => {
    music1.current?.pause();
    music2.current?.pause();
    setDialogMsg(null);
    setGameResultModalOnOff(true);
  });

  useSocketOn(SocketEvents.SET_EXPULSION, (id: string) => {
    if (socket && id === socket.id) {
      router.push('/lobby');
    }
  });

  useEffect(() => {
    if (!gameResultModalOnOff) return;
    setTimeout(() => {
      setGameResultModalOnOff(false);
    }, 4000);
  }, [gameResultModalOnOff]);

  useSocketOn(SocketEvents.SET_GAME_ROOM, (gameRoom: GameRoom) => {
    if (!gameRoom) return;
    setGameRoom(gameRoom);
  });

  useLeavePage(() => {
    if (!socket) return;
    dispatch({ type: RoomActions.SET_UUID, payload: { uuid: null } });
    socket.emit(SocketEvents.LEAVE_ROOM, uuid);
  });

  const handleAudioEnded: ReactEventHandler<HTMLAudioElement> = (e) => {
    const audio = e.target as HTMLAudioElement;
    audio.currentTime = 0;
    audio.play();
  };

  return (
    <Container>
      <GameRoomNav
        players={gameRoom?.players}
        status={gameRoom?.status}
        music1={music1.current}
        music2={music2.current}
        isAllReady={gameRoom?.isAllReady}
      />
      <GameRoomContainer players={gameRoom?.players} gameRoom={gameRoom} />
      <audio ref={music1} onEnded={handleAudioEnded} />
      <audio ref={music2} onEnded={handleAudioEnded} />
      {dialogMsg && <BlurDialog title={dialogMsg.title} content={dialogMsg.content} />}
      {gameResultModalOnOff && <ResultModal gameRoom={gameRoom} playlistId={gameRoom?.playlistId} />}
    </Container>
  );
};

export default Game;
