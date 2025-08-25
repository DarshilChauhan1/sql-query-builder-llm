export interface ResponseInterface<T> {
    success: boolean;
    message: string;
    statusCode: number;
    data: T;
}