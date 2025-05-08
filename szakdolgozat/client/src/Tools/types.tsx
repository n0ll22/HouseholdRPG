//Ebben a file-ban található a legtöbb változó típus

export const apiUrl = import.meta.env.VITE_API;

export interface RegistrationData {
  email: string;
  username: string;
  password: string;
  passwordAgain: string;
}

export interface TaskProp {
  _id: string;
  title: string;
  exp: number;
  description: string;
  tutorial: string[];
  _length: number;
}

export interface TaskDataProp {
  tasks: TaskProp[];
  totalTask: number;
  totalPages: number;
  currentPage: number;
}

export interface Process {
  _id: string;
  userId: UserProp["_id"];
  taskId: TaskProp["_id"];
  duration: number;
  startTime: number;
  progress: number;
  completed: boolean;
}

export interface RenderHUDProps {
  lvl: number;
  startExp: number;
  nextLvlExp: number;
  currentExp: number;
}

export interface QueryProps {
  searchOn: string;
  search: string;
  sortBy: string;
  order: string;
  page: number;
  limit: number;
}

export interface ChatProp {
  latest: { senderId: string; _id: string; content: string };
  _id: string;
  name: string;
  isGroup: boolean;
  participants: FriendshipProp["otherUser"][];
}

export interface MessageProp {
  _id: string;
  senderId: FriendshipProp["otherUser"];
  chatId: string;
  content: string;
}

export interface MessagePropSend {
  senderId: string;
  chatId: string;
  content: string;
}

export interface ChatRoomProp {
  chat: ChatProp;
  messages: MessageProp[];
}

export interface Participant {
  avatar: UserProp["avatar"];
  username: UserProp["username"];
  _id: UserProp["_id"];
  status: UserProp["status"];
}

export interface UserDataProp {
  users: UserProp[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

export interface UserProp {
  email: string;
  _id: string;
  username: string;
  avatar: string;
  exp: number;
  lvl: number;
  taskToday: string[];
  friendships: string[];
  description: string;
  banner: string;
  status: string;
  isAdmin: boolean;
}

export interface ExtendedUser {
  avatarDiv: JSX.Element;
  username: string;
  lvl: number;
  _id: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface Levels {
  exp: number;
  level: number;
  diff: number;
}

export interface FriendshipProp {
  senderId: string;
  otherUser: {
    _id: UserProp["_id"];
    avatar: UserProp["avatar"];
    username: UserProp["username"];
    lvl: UserProp["lvl"];
    status: UserProp["status"];
  };
  currentUser: {
    _id: UserProp["_id"];
    avatar: UserProp["avatar"];
    username: UserProp["username"];
    lvl: UserProp["lvl"];
    status: UserProp["status"];
  };
  _id: string;
  status: string;
  blockedBy: string;
}
