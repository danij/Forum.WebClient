export module TagRepository {

    export interface Tag {
        id: string;
        name: string;
        created: number;
        threadCount: number;
        messageCount: number;
    }
}
