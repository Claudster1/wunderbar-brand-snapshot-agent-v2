// src/types.ts

export type Role = 'user' | 'assistant';

export interface BrandChatMessage {
  id: string;
  role: Role;
  text: string;
}
