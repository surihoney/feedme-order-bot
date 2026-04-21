export type OrderType = 'VIP' | 'NORMAL';

export type OrderStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED';

export interface Order {
    id: number;
    type: OrderType;
    status: OrderStatus;
    createdAt: number;
    startedAt?: number;
    duration?: number;
    completedAt?: number;
}

export interface Bot {
    id: number;
    status: 'IDLE' | 'WORKING';
    currentOrderId?: number;
}

export interface AppState {
    orders: Order[];
    bots: Bot[];

    nextOrderId: number;
    nextBotId: number;

    addOrder: (type: OrderType) => void;
    addBot: () => void;
    removeBot: () => void;
}