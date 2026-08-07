/**
 * One home for the placeholder asset URLs, so the hero's wall and the work rail
 * show the same media and swapping in real assets is one edit rather than two.
 *
 * Only the URLs live here. Neither section's *layout* metadata does: the wall
 * needs a vertical span, the rail needs an aspect ratio and a category, and a
 * type carrying both would fit neither. Each section keeps its own list and
 * calls these for the src.
 */

/** Unsplash. `w` is the delivered width - the rail asks for more than the wall
    because its tiles can span both rows. */
export const imageUrl = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;

/** Square, face-centred crop for the review avatars. `crop=faces` is Unsplash's
    own detector - without it a portrait delivered at w=h gets a centre crop,
    which on a head-and-shoulders shot lands on the chin. */
export const faceUrl = (id: string, size = 96) =>
  `https://images.unsplash.com/${id}?w=${size}&h=${size}&q=70&auto=format&fit=crop&crop=faces`;

export const videoUrl = (id: string) =>
  `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_30fps.mp4`;
