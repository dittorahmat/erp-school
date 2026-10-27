export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export const DEMO_USERS: Record<string, UserProfile> = {
  admin: {
    name: 'Bambang Sudarmono, M.Pd',
    role: 'superadmin',
    email: 'admin@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
  },
  finance: {
    name: 'Siti Rahmawati, S.E',
    role: 'accountant',
    email: 'finance@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100'
  },
  teacher: {
    name: 'Budi Santoso, S.Pd',
    role: 'teacher',
    email: 'guru.budi@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
  },
  student: {
    name: 'Andi Pratama',
    role: 'student',
    email: 'student.andi@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'
  },
  guardian: {
    name: 'Joko Pratama',
    role: 'guardian',
    email: 'ortu.andi@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
  }
};
