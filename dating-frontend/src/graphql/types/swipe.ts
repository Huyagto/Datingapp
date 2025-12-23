export interface SwipeResult {
  isMatch: boolean;
  matchId?: string | null;
}

export interface SwipeUserResponse {
  swipeUser: SwipeResult;
}

export interface SwipeUserVariables {
  input: {
    toUserId: string;
    type: "LIKE" | "PASS";
  };
}
