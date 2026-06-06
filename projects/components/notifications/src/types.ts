export interface NotificationActorLike {
  id: string | number;
  name: string;
  username?: string;
  avatarUrl: string;
}

export interface NotificationInterface<TActor extends { id: string | number } = NotificationActorLike, TPayload = any> {
  actor: TActor;
  type: string;
  createdAt: string;
  isUnread?: boolean;
  payload?: TPayload;
  [propName: string]: any;
}
