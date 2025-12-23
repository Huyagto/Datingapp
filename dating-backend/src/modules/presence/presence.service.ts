// src/presence/presence.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private onlineUsers = new Map<string, number>(); // userId -> timestamp
  private readonly TIMEOUT_SECONDS = 30;

  setOnline(userId: string): void {
    this.onlineUsers.set(userId, Date.now());
  }

  setOffline(userId: string): void {
    this.onlineUsers.delete(userId);
  }

  isOnline(userId: string): boolean {
    const timestamp = this.onlineUsers.get(userId);
    
    if (!timestamp) return false;
    
    const now = Date.now();
    const diffSeconds = (now - timestamp) / 1000;
    
    if (diffSeconds > this.TIMEOUT_SECONDS) {
      this.onlineUsers.delete(userId);
      return false;
    }
    
    return true;
  }

  getOnlineUsers(): string[] {
    const now = Date.now();
    const online: string[] = [];
    
    for (const [userId, timestamp] of this.onlineUsers.entries()) {
      const diffSeconds = (now - timestamp) / 1000;
      
      if (diffSeconds <= this.TIMEOUT_SECONDS) {
        online.push(userId);
      } else {
        this.onlineUsers.delete(userId);
      }
    }
    
    return online;
  }

  getLastSeen(userId: string): number | null {
    return this.onlineUsers.get(userId) || null;
  }
}