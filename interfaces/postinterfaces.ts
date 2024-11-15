export interface PostProps {
    address: string,
    description: string,
    image: string,
    date: Date,
    username?: string,
    postedBy?: string,
    likes?: number,
}
    export interface DefaultResponse {
        isSuccess: boolean;
        message: string;
}