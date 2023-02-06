declare module "@zerosecrets/zero" {
    export const zero: (params: {
        pick: string[];
        token: string;
        callerName?: string;
    }) => {
        fetch(): Promise<{
            [key: string]: {
                [key: string]: string;
            } | undefined;
        }>;
    };
}
