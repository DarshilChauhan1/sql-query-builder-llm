interface StreamingResponse {
    type : string;
    data : any;
    error?: string;
}

export interface StreamEventData {
    type: 'message' | 'chunk' | 'error' | 'complete' | 'sql_generated';
    data?: any;
    message?: string;
}

export interface StreamMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
    conversationId: string;
    isStreaming?: boolean;
    sqlQuery?: string;
    queryResult?: any;
}