export module UserRepository {

    export interface User {
        id: string;
        name: string;
        info: string;
        title: string;
        signature: string;
        hasLogo: boolean;
        created: number;
        lastSeen: number;
        threadCount: number;
        messageCount: number;
        upVotes: number;
        downVotes: number;
    }
}