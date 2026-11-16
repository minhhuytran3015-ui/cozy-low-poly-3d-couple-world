export type WallType = 'north' | 'south' | 'east' | 'west';

export interface Memory {
  id: string;
  title: string;
  description?: string;
  date?: string;
  type: 'image' | 'video';
  src: string | null;
  thumbnail?: string | null;
  wall: WallType;
  position: [number, number]; // [horizontal offset along wall, height Y]
  width: number;
  height: number;
  orientation?: 'landscape' | 'portrait' | 'square';
}

/**
 * 15 Curated Memories distributed thoughtfully across the 4 walls:
 * - North Wall: 4 frames (1.jpg, 2.jpg, 3.mp4, 4.jpg)
 * - South Wall: 3 frames (5.jpg, 6.jpg, 7.jpg)
 * - East Wall:  4 frames (8.jpg, 9.jpg, 10.jpg, 11.jpg)
 * - West Wall:  4 frames (12.mp4, 13.jpg, 14.jpg, 15.jpg)
 */
export const memories: Memory[] = [
  // =========================================================================
  // NORTH WALL (Z = -5.0) - 4 Frames
  // Safe horizontal X range: [-2.4 to +3.6] (avoids corner plant at X = -3.8)
  // =========================================================================
  {
    id: 'memory-01',
    title: '',
    description: 'Lúc này tụi mình đi nặn đát sét cùng nhau nè emm',
    date: '29-10-2026',
    type: 'image',
    src: '/memories/1.jpg',
    wall: 'north',
    position: [-2.2, 2.2],
    width: 1.25,
    height: 1.25,
    orientation: 'square',
  },
  {
    id: 'memory-02',
    title: '',
    description: 'Coi cái mặt của em háy ghéc chưa kìaaaaaa',
    date: '29-10-2026',
    type: 'image',
    src: '/memories/2.jpg',
    wall: 'north',
    position: [-0.6, 2.25],
    width: 1.55,
    height: 0.85,
    orientation: 'landscape',
  },
  {
    id: 'memory-03',
    title: '',
    description: 'time-lapse quá trình hai đứa mình nặn đất sét nè zk húi',
    date: '29-10-2026',
    type: 'video',
    src: '/memories/3.mp4',
    thumbnail: '/memories/3_thumb.jpg',
    wall: 'north',
    position: [1.1, 2.2],
    width: 1.55,
    height: 0.88,
    orientation: 'landscape',
  },
  {
    id: 'memory-04',
    title: '',
    description: 'Để đây và hong nói gì hihi',
    date: '29-10-2026',
    type: 'image',
    src: '/memories/4.jpg',
    wall: 'north',
    position: [2.8, 2.25],
    width: 1.50,
    height: 0.85,
    orientation: 'landscape',
  },

  // =========================================================================
  // SOUTH WALL (Z = +5.0) - 3 Frames
  // Safe horizontal X range: [-2.6 to +2.6]
  // =========================================================================
  {
    id: 'memory-05',
    title: '',
    description: 'Dễ thương hahaha',
    date: '22-10-2026',
    type: 'image',
    src: '/memories/5.jpg',
    wall: 'south',
    position: [-2.2, 2.2],
    width: 1.25,
    height: 1.25,
    orientation: 'square',
  },
  {
    id: 'memory-06',
    title: '',
    description: 'Bó hoa đầu tiên anh tặng em',
    date: '20-10-2026',
    type: 'image',
    src: '/memories/6.jpg',
    wall: 'south',
    position: [0.0, 2.25],
    width: 0.88,
    height: 1.56,
    orientation: 'portrait',
  },
  {
    id: 'memory-07',
    title: '',
    description: 'mua charm cho vk iu nèee',
    date: '05-10-2026',
    type: 'image',
    src: '/memories/7.jpg',
    wall: 'south',
    position: [2.2, 2.2],
    width: 1.25,
    height: 1.25,
    orientation: 'square',
  },

  // =========================================================================
  // EAST WALL (X = +5.0) - 4 Frames
  // Safe horizontal Z range: [-2.0 to +3.4] (avoids corner floor lamp at Z = -3.8)
  // =========================================================================
  {
    id: 'memory-08',
    title: '',
    description: 'Lúc này hai đứa mình đi Thảo Cầm Viên nè vkk húi, tấm này em tặng anh với cái ví nè hehe anh thích voãiii. Yêu em nhiều',
    date: '01-10-2026',
    type: 'image',
    src: '/memories/8.jpg',
    wall: 'east',
    position: [-1.8, 2.2],
    width: 1.05,
    height: 1.40,
    orientation: 'portrait',
  },
  {
    id: 'memory-09',
    title: '',
    description: 'Lần đầu chụp photobooth cùng nhau',
    date: '11-09-2026',
    type: 'image',
    src: '/memories/9.jpg',
    wall: 'east',
    position: [-0.2, 2.25],
    width: 1.45,
    height: 0.97,
    orientation: 'landscape',
  },
  {
    id: 'memory-10',
    title: '',
    description: 'Chị Hằng xinh đẹp và anh trai may mắn =))))))',
    date: '25-09-2026',
    type: 'image',
    src: '/memories/10.jpg',
    wall: 'east',
    position: [1.3, 2.2],
    width: 0.95,
    height: 1.42,
    orientation: 'portrait',
  },
  {
    id: 'memory-11',
    title: '',
    description: 'thơm em',
    date: '11-09-2026',
    type: 'image',
    src: '/memories/11.jpg',
    wall: 'east',
    position: [2.8, 2.2],
    width: 1.45,
    height: 0.97,
    orientation: 'landscape',
  },

  // =========================================================================
  // WEST WALL (X = -5.0) - 4 Frames
  // Safe horizontal Z range: [-2.0 to +3.4] (avoids corner plant at Z = -3.8)
  // =========================================================================
  {
    id: 'memory-12',
    title: '',
    description: 'dật dật ngầu đét',
    date: '11-09-2026',
    type: 'video',
    src: '/memories/12.mp4',
    thumbnail: '/memories/12_thumb.jpg',
    wall: 'west',
    position: [-1.8, 2.25],
    width: 0.88,
    height: 1.56,
    orientation: 'portrait',
  },
  {
    id: 'memory-13',
    title: '',
    description: 'Lúc này đi chơi mà nước ngập dữ nè, khổ mà có kỉ niệm hihi',
    date: '10-09-2026',
    type: 'image',
    src: '/memories/13.jpg',
    wall: 'west',
    position: [-0.2, 2.2],
    width: 1.25,
    height: 1.25,
    orientation: 'square',
  },
  {
    id: 'memory-14',
    title: '',
    description: 'Những ngày bầu cử nè, lúc này tự nhiên em gửi tấm này cho anh, anh nghĩ em thích tấm này lắm ',
    date: '15-03-2026',
    type: 'image',
    src: '/memories/14.jpg',
    wall: 'west',
    position: [1.3, 2.2],
    width: 1.35,
    height: 1.12,
    orientation: 'landscape',
  },
  {
    id: 'memory-15',
    title: '',
    description: 'này được vk tặng trái banh dễ thương  ớnnnn',
    date: '07-09-2026',
    type: 'image',
    src: '/memories/15.jpg',
    wall: 'west',
    position: [2.8, 2.25],
    width: 1.05,
    height: 1.36,
    orientation: 'portrait',
  },
];

export default memories;
