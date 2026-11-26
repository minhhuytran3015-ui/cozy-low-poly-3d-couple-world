export type GiftShapeType = 'ring' | 'bouquet' | 'bear' | 'wallet' | 'musicbox';

export interface GiftCaseItem {
  id: string;
  title: string;
  giver: string;
  date: string;
  description: string;
  position: [number, number, number];
  shape: GiftShapeType;
  accentColor: string;
}

/**
 * 5 Glass Display Cases placed on the lush grass floor of the Museum Room.
 * You can customize the title, date, giver, and description of each gift here!
 */
export const giftCases: GiftCaseItem[] = [
  {
    id: 'gift-01',
    title: 'Chiếc ví kỷ niệm',
    giver: 'Ngọc Hân tặng Minh Huy',
    date: '01-10-2026',
    description: 'Món quà nhỏ xinh đi Thảo Cầm Viên cùng nhau — lúc nào cũng mang theo bên mình.',
    position: [9.2, 0, -3.5],
    shape: 'wallet',
    accentColor: '#c97b5d',
  },
  {
    id: 'gift-02',
    title: 'Bó hoa đầu tiên',
    giver: 'Minh Huy tặng Ngọc Hân',
    date: '11-09-2026',
    description: 'Bó hoa nhỏ nhưng gói trọn cả sự hồi hộp và niềm vui ngày đầu tiên.',
    position: [9.2, 0, 3.5],
    shape: 'bouquet',
    accentColor: '#e86f8c',
  },
  {
    id: 'gift-03',
    title: 'Chiếc nhẫn hẹn ước',
    giver: 'Tụi mình tặng nhau',
    date: '29-10-2026',
    description: 'Tủ kính trung tâm lưu giữ kỷ vật đặc biệt nhất của hai đứa.',
    position: [13.4, 0, 0],
    shape: 'ring',
    accentColor: '#eab308',
  },
  {
    id: 'gift-04',
    title: 'Chú gấu bông ôm ngủ',
    giver: 'Minh Huy tặng Ngọc Hân',
    date: '25-09-2026',
    description: 'Mỗi khi nhớ nhau thì ôm bạn gấu này một cái thật chặt nhé.',
    position: [17.4, 0, -3.5],
    shape: 'bear',
    accentColor: '#b8825b',
  },
  {
    id: 'gift-05',
    title: 'Hộp nhạc kỷ niệm',
    giver: 'Ngọc Hân tặng Minh Huy',
    date: '15-10-2026',
    description: 'Giai điệu êm dịu lưu lại những buổi tối trò chuyện thật lâu.',
    position: [17.4, 0, 3.5],
    shape: 'musicbox',
    accentColor: '#5c8075',
  },
];
