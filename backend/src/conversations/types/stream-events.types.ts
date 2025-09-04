export interface StreamEventData {
  type: 'user_message_created' | 'sql_generated' | 'query_executed' | 'llm_stream_start' | 'llm_chunk' | 'assistant_message_saved' | 'error';
  data?: any;
  message?: string;
}

export interface SSEMessageEvent {
  data: StreamEventData;
  type?: string;
  id?: string;
  retry?: number;
}

export interface LLMChunkData {
  content: string;
}

export interface QueryExecutedData {
  results: any[];
}

export interface SQLGeneratedData {
  sqlQuery: string;
}

export interface ErrorData {
  message: string;
}

export interface UserMessageCreatedData {
  id: string;
  conversationId: string;
  prompt: string;
  role: 'user';
  createdAt: string;
}

export interface AssistantMessageSavedData {
  message: {
    id: string;
    conversationId: string;
    prompt: string;
    role: 'assistant';
    sqlQuery?: string;
    queryResult?: string;
    createdAt: string;
  };
}
