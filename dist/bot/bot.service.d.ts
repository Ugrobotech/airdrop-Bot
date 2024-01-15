export declare class BotService {
    private readonly bot;
    private logger;
    constructor();
    onReceiveMessage: (msg: any) => void;
    sendMessageToUser: (userId: string, message: string) => void;
    sendMainMenu: (chatId: string) => void;
    handleAirdropCommands: (msg: any) => void;
    sendHottestAirdrops: (chatId: string) => void;
    sendAirdropDetails: (chatId: string, airdropName: string, steps: string, cost: string) => void;
    sendPotentialAirdrops: (chatId: string) => void;
    sendLatestAirdrops: (chatId: string) => void;
}
