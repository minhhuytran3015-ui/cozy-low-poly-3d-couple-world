export interface CharacterInfo {
  id: string;
  displayName: string;
  avatarIcon: string;
  themeColor: string;
  accentBg: string;
}

export const characterConfig: Record<'boy' | 'girl', CharacterInfo> = {
  boy: {
    id: 'boy',
    displayName: 'Minh Huy',
    avatarIcon: '👦',
    themeColor: '#43695f',
    accentBg: '#eaf2ee',
  },
  girl: {
    id: 'girl',
    displayName: 'Ngọc Hân',
    avatarIcon: '👧',
    themeColor: '#c96e60',
    accentBg: '#faece9',
  },
};

export default characterConfig;
