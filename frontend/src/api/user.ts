import { updateStoreData } from '~/api/account';
import { BACKEND_URL } from '~/constants/index';
import API from '~/utils/API';

const handleNonUserColor = (color: string) =>
  API('POST')(`${BACKEND_URL}/user/guest-color`)({ body: JSON.stringify({ color }) });

const handleColor = (id: string, color: string) =>
  API('POST')(`${BACKEND_URL}/user/color`)({ body: JSON.stringify({ id, color }) });

export const changeColor = async (id: string, color: string) => {
  id ? handleColor(id, color) : handleNonUserColor(color);
};

export const getMyPlaylist = async (_id: Array<string>) => {
  if (!_id) return;
  const res = await API('GET')(`${BACKEND_URL}/user/playlist?_id=${JSON.stringify(_id)}`)();
  return res.json();
};

export const deleteLikes = async (id: string, _id: string) => {
  await API('DELETE')(`${BACKEND_URL}/user/likes`)({ body: JSON.stringify({ id, _id }) });
  return true;
};
