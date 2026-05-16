export type Profile = {
  id: string;
  name: string;
  neighborhood: string | null;
  points: number;
  role: 'user' | 'admin';
  created_at: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  proof_type: 'photo' | 'qr';
  qr_method: 'auto' | 'event' | 'organizer' | null;
  qr_data: string | null;
  active: boolean;
  created_at: string;
};

export type Request = {
  id: string;
  user_id: string;
  quest_id: string;
  status: 'pending' | 'approved' | 'rejected';
  photo_url: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type RequestWithDetails = Request & {
  quest: Quest;
  profile: Profile;
};
