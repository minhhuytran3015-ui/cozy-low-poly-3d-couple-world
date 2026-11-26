import {
  MUSEUM_MAX_X,
  MUSEUM_MAX_Z,
  MUSEUM_MIN_X,
  MUSEUM_MIN_Z,
  ROOM1_HALF,
} from './roomConfig';

export type WallType =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'museum-north'
  | 'museum-south'
  | 'museum-east'
  | 'museum-west';

export function getWallFrameTransform(
  wall: WallType,
  position: [number, number]
): { framePos: [number, number, number]; frameRot: [number, number, number] } {
  const offset = 0.04;
  switch (wall) {
    case 'north':
      return {
        framePos: [position[0], position[1], -(ROOM1_HALF - offset)],
        frameRot: [0, 0, 0],
      };
    case 'south':
      return {
        framePos: [position[0], position[1], ROOM1_HALF - offset],
        frameRot: [0, Math.PI, 0],
      };
    case 'east':
      return {
        framePos: [ROOM1_HALF - offset, position[1], position[0]],
        frameRot: [0, -Math.PI / 2, 0],
      };
    case 'west':
      return {
        framePos: [-(ROOM1_HALF - offset), position[1], position[0]],
        frameRot: [0, Math.PI / 2, 0],
      };
    case 'museum-north':
      return {
        framePos: [position[0], position[1], MUSEUM_MIN_Z + offset],
        frameRot: [0, 0, 0],
      };
    case 'museum-south':
      return {
        framePos: [position[0], position[1], MUSEUM_MAX_Z - offset],
        frameRot: [0, Math.PI, 0],
      };
    case 'museum-east':
      return {
        framePos: [MUSEUM_MAX_X - offset, position[1], position[0]],
        frameRot: [0, -Math.PI / 2, 0],
      };
    case 'museum-west':
      return {
        framePos: [MUSEUM_MIN_X + offset, position[1], position[0]],
        frameRot: [0, Math.PI / 2, 0],
      };
  }
}

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
  // EAST WALL (X = +5.0) - 4 Frames (avoids doorway at Z in [-0.85, +0.85])
  // =========================================================================
  {
    id: 'memory-08',
    title: '',
    description: 'Lúc này hai đứa mình đi Thảo Cầm Viên nè vkk húi, tấm này em tặng anh với cái ví nè hehe anh thích voãiii. Yêu em nhiều',
    date: '01-10-2026',
    type: 'image',
    src: '/memories/8.jpg',
    wall: 'east',
    position: [-2.05, 2.2],
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
    position: [1.75, 2.25],
    width: 1.35,
    height: 0.9,
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
    position: [3.0, 2.2],
    width: 0.9,
    height: 1.34,
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
    position: [4.2, 2.2],
    width: 1.25,
    height: 0.85,
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

  // =========================================================================
  // MUSEUM ROOM (X: 5.4..21.4, Z: -8.0..+8.0) - 18 Curated Slots
  // 17 real couple photos + 1 open slot for future memories
  // =========================================================================
  // Museum North Wall (Z = -8.0) - 5 Frames
  {
    id: 'museum-01',
    title: 'Đêm sinh nhật đáng yêu',
    description: 'Chiếc nón sinh nhật hồng, túi quà nhỏ và nụ cười rạng rỡ dưới ánh đèn công viên buổi tối.',
    date: '',
    type: 'image',
    src: '/memories/museum_01.jpg',
    wall: 'museum-north',
    position: [7.4, 2.3],
    width: 1.32,
    height: 1.32,
    orientation: 'square',
  },
  {
    id: 'museum-02',
    title: 'Check-in cùng ông già Noel',
    description: 'Ghé quán nước mùa Giáng sinh, đứng cạnh cây thông râu trắng mà mặt vẫn còn nguyên combo chống nắng.',
    date: '',
    type: 'image',
    src: '/memories/museum_02.jpg',
    wall: 'museum-north',
    position: [10.4, 2.3],
    width: 1.32,
    height: 1.32,
    orientation: 'square',
  },
  {
    id: 'museum-03',
    title: 'Hai bạn áo xanh trên chuyến xe',
    description: 'Cùng mặc áo Đoàn thanh niên ngồi cạnh nhau trên xe, giơ tay chữ V lưu lại khoảnh khắc thật vui.',
    date: '',
    type: 'image',
    src: '/memories/museum_03.jpg',
    wall: 'museum-north',
    position: [13.4, 2.3],
    width: 1.32,
    height: 1.32,
    orientation: 'square',
  },
  {
    id: 'museum-04',
    title: 'Cuộn tròn trong chăn hồng',
    description: 'Gương mặt dịu dàng ấm áp trong chiếc chăn chấm bi hồng, nhìn một cái là thấy bình yên.',
    date: '',
    type: 'image',
    src: '/memories/museum_04.jpg',
    wall: 'museum-north',
    position: [16.4, 2.25],
    width: 0.9,
    height: 1.56,
    orientation: 'portrait',
  },
  {
    id: 'museum-05',
    title: 'Nheo mắt dưới nắng vàng',
    description: 'Nắng chiếu chói chang làm em nhăn mũi đưa tay che nắng, vậy mà vẫn tươi rói luôn.',
    date: '',
    type: 'image',
    src: '/memories/museum_05.jpg',
    wall: 'museum-north',
    position: [19.4, 2.25],
    width: 1.08,
    height: 1.44,
    orientation: 'portrait',
  },

  // Museum South Wall (Z = +8.0) - 5 Frames
  {
    id: 'museum-06',
    title: 'Áp má dưới ánh đèn đêm',
    description: 'Khoảnh khắc hai đứa kề sát bên nhau buổi tối, em ôm má cười tươi còn anh mỉm cười thật hiền.',
    date: '',
    type: 'image',
    src: '/memories/museum_06.jpg',
    wall: 'museum-south',
    position: [7.4, 2.25],
    width: 1.08,
    height: 1.44,
    orientation: 'portrait',
  },
  {
    id: 'museum-07',
    title: 'Biểu cảm nhăn mũi siêu quậy',
    description: 'Pha tạo dáng nhăn mũi trợn mắt đầy hài hước nhưng độ đáng yêu thì không giảm chút nào.',
    date: '',
    type: 'image',
    src: '/memories/museum_07.jpg',
    wall: 'museum-south',
    position: [10.4, 2.25],
    width: 0.9,
    height: 1.56,
    orientation: 'portrait',
  },
  {
    id: 'museum-08',
    title: 'Cuộc gọi đêm khuya',
    description: 'Em ngủ say giấc trong cuộc gọi video, còn anh vẫn thức lặng lẽ chụp lại khoảnh khắc bình yên này.',
    date: '',
    type: 'image',
    src: '/memories/museum_08.jpg',
    wall: 'museum-south',
    position: [13.4, 2.25],
    width: 0.85,
    height: 1.58,
    orientation: 'portrait',
  },
  {
    id: 'museum-09',
    title: 'Chinh phục máy gắp gấu',
    description: 'Dáng đứng tập trung cao độ trước tủ gắp thú hồng rực, quyết tâm rinh bằng được một em gấu bông.',
    date: '',
    type: 'image',
    src: '/memories/museum_09.jpg',
    wall: 'museum-south',
    position: [16.4, 2.25],
    width: 1.08,
    height: 1.44,
    orientation: 'portrait',
  },
  {
    id: 'museum-10',
    title: 'Ôm bé Hello Kitty nơ đỏ',
    description: 'Nhắm mắt mỉm cười thật ngọt khi ôm trọn chú mèo Hello Kitty trắng muốt trong vòng tay.',
    date: '',
    type: 'image',
    src: '/memories/museum_10.jpg',
    wall: 'museum-south',
    position: [19.4, 2.25],
    width: 1.08,
    height: 1.44,
    orientation: 'portrait',
  },

  // Museum East Wall (X = +21.4) - 5 Frames
  {
    id: 'museum-11',
    title: 'Nụ cười cận cảnh lầy lội',
    description: 'Tấm ảnh chụp vội hơi nhòe nhưng lưu trọn tiếng cười giòn tan và sự nhí nhảnh của hai đứa.',
    date: '',
    type: 'image',
    src: '/memories/museum_11.jpg',
    wall: 'museum-east',
    position: [-5.6, 2.25],
    width: 0.9,
    height: 1.56,
    orientation: 'portrait',
  },
  {
    id: 'museum-12',
    title: 'Đi chọn lồng đèn Trung Thu',
    description: 'Giữa gian hàng rực rỡ sắc màu, em cầm chiếc đèn bướm xinh xắn và nở nụ cười tươi hơn cả ánh đèn.',
    date: '',
    type: 'image',
    src: '/memories/museum_12.jpg',
    wall: 'museum-east',
    position: [-2.8, 2.25],
    width: 1.08,
    height: 1.44,
    orientation: 'portrait',
  },
  {
    id: 'museum-13',
    title: 'Đại ca râu quai nón & bánh tráng',
    description: 'Filter râu quai nón bá đạo kèm bịch bánh tráng trộn — nhìn vừa ngầu vừa không nhịn được cười.',
    date: '',
    type: 'image',
    src: '/memories/museum_13.jpg',
    wall: 'museum-east',
    position: [0, 2.25],
    width: 0.9,
    height: 1.56,
    orientation: 'portrait',
  },
  {
    id: 'museum-14',
    title: 'Chu môi đáng yêu',
    description: 'Góc cận mặt siêu xinh với đôi mắt long lanh và cái chu môi làm nũng hết phần thiên hạ.',
    date: '',
    type: 'image',
    src: '/memories/museum_14.jpg',
    wall: 'museum-east',
    position: [2.8, 2.25],
    width: 0.85,
    height: 1.58,
    orientation: 'portrait',
  },
  {
    id: 'museum-15',
    title: 'Tự hào hai tấm giấy khen',
    description: 'Nụ cười rạng rỡ khi cầm trên tay hai tờ giấy khen chiến dịch tình nguyện và sinh hoạt hè khu phố 35.',
    date: '',
    type: 'image',
    src: '/memories/museum_15.jpg',
    wall: 'museum-east',
    position: [5.6, 2.3],
    width: 1.32,
    height: 1.32,
    orientation: 'square',
  },

  // Museum West Wall (X = +5.4, flanking the doorway) - 3 Frames
  {
    id: 'museum-16',
    title: 'Giải Nhất song ca mùa hè',
    description: 'Kỷ niệm đáng nhớ với tấm giấy khen Giải Nhất tiết mục song ca "Em yêu mùa hè quê em" năm 2026.',
    date: '',
    type: 'image',
    src: '/memories/museum_16.jpg',
    wall: 'museum-west',
    position: [-4.6, 2.3],
    width: 1.32,
    height: 1.32,
    orientation: 'square',
  },
  {
    id: 'museum-17',
    title: 'Tựa vai dưới tán cây đêm',
    description: 'Em nghiêng đầu giơ tay chữ V dịu dàng, còn anh lè lưỡi tinh nghịch dưới tán cây mát lành buổi tối.',
    date: '',
    type: 'image',
    src: '/memories/museum_17.jpg',
    wall: 'museum-west',
    position: [2.8, 2.25],
    width: 1.08,
    height: 1.44,
    orientation: 'portrait',
  },
  {
    id: 'museum-18',
    title: 'Khung chờ kỷ niệm mới',
    description: 'Một khoảng trống nhỏ dành riêng cho những chuyến đi và bức ảnh tiếp theo của hai đứa mình.',
    date: '',
    type: 'image',
    src: null,
    wall: 'museum-west',
    position: [5.6, 2.3],
    width: 1.45,
    height: 1.05,
    orientation: 'landscape',
  },
];

export default memories;
