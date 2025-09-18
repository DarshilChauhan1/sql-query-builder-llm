/**
 * Streaming Service for Real-time AI Chat Communication
 * 
 * Backend Flow Analysis:
 * 1. User message creation → database save
 * 2. SQL query generation from natural language prompt
 * 3. SQL query execution against user's database
 * 4. LLM response generation with query results
 * 5. Real-time streaming of LLM response chunks
 * 6. Final assistant message save to database
 * 
 * Stream Event Types from Backend:
 * - user_message_created: User message saved to DB
 * - sql_generated: SQL query generated from prompt
 * - query_executed: SQL query executed, results available
 * - llm_stream_start: LLM response streaming begins
 * - llm_chunk: Individual content chunks from LLM
 * - assistant_message_saved: Final assistant message saved
 * - error: Any error during the process
 */

// Backend Event Data Interfaces (matching backend types)
export interface StreamEventData {
    type: 'user_message_created' | 'sql_generated' | 'query_executed' | 'llm_stream_start' | 'llm_chunk' | 'assistant_message_saved' | 'error';
    data?: any;
    message?: string;
}

export interface LLMChunkData {
    content: string;
}

export interface ErrorMessages {
    type: 'error';
    message: string;
}

export interface SendMessageRequest {
    conversationId: string;
    prompt: string;
}

export class StreamingService {
    private isStreaming: boolean = false;

    async startStreaming(request: SendMessageRequest, token: string, onMessage: (data: StreamEventData) => void, onError: (error: any) => void, onComplete: () => void) {
        if (this.isStreaming) {
            console.warn('A streaming session is already in progress.');
            return;
        }

        this.isStreaming = true;
        const abortController = new AbortController();

        try {
            const query = new URLSearchParams({
                conversationId: request.conversationId,
                prompt: request.prompt,
            });

            const response = await fetch(`/api/conversations/chat-stream?${query.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                signal: abortController.signal
            })

            if (!response.ok || !response.body) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (this.isStreaming) {
                const { done, value } = await reader.read();
                console.log('Stream read:', { done, value });
            }

        } catch (error) {
            console.error('Streaming error:', error);
            onError(error);
        }
    }
}





