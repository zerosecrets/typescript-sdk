declare module "@zerosecrets/zero" {
    export const zero: <T extends string>(params: {
        apis: T[];
        token: string;
    }) => {
        fetch(): Promise<{
            T?: {
                [key: string]: string;
            } | undefined;
        }>;
    };
}
