declare module "@zerosecrets/zero" {
    export const zero: (params: {
        pick: string[];
        token: string;
    }) => {
        fetch(): Promise<{
            [key: string]: {
                [key: string]: string;
            } | undefined;
        }>;
    };
}
