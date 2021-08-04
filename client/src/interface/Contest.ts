import { User } from './User';

export interface Contest {
  _id: string;
  ownerName: string;
  title: string;
  description: string;
  prizeAmount: number;
  createDate: Date | string;
  endDate: Date | string;
  imageArray: string[];
  profileImg: string;
}

export interface SubmissionAPIData {
  _id: string;
  files: string[];
  contestId: string;
  userId: string;
  isActive: boolean;
  submitDate: Date;
  __v: number;
}

export interface ContestAPIData {
  _id: string;
  title: string;
  description: string;
  prizeAmount: number;
  deadline: Date;
  __v: number;
  user: User;
  created: Date | string;
  subs: SubmissionAPIData[];
  winningSubmission?: string;
}

export interface ContestAPIResponse {
  success?: boolean;
  error?: boolean;
  contests?: ContestAPIData[];
}
