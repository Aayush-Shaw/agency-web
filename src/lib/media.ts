/** Square, face-centred crop for the review avatars. `crop=faces` is Unsplash's
    own detector - without it a portrait delivered at w=h gets a centre crop,
    which on a head-and-shoulders shot lands on the chin. */
export const faceUrl = (id: string, size = 96) =>
  `https://images.unsplash.com/${id}?w=${size}&h=${size}&q=70&auto=format&fit=crop&crop=faces`;

export const gridVideo = (filename: string) => `/vid/grid/${filename}`;
export const popupVideo = (filename: string) => `/vid/popup/${filename}`;
export const posterVideo = (filename: string) =>
  `/vid/poster/${filename.replace(/\.[^.]+$/, ".jpg")}`;
