export enum View {
  CHAT = 'CHAT',
  FILES = 'FILES',
  NOTES = 'NOTES',
  TASKS = 'TASKS'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
}

export interface UploadedFile {
  name: string;
  content: string;
  type: string;
  size: number;
}
