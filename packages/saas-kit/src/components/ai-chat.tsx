import { FormEvent, useRef, useState } from 'react';
import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
} from '@/components/ai-elements/prompt-input';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageAvatar, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import { Button } from '@/components/ui/button';
import { focusElement } from '@/lib/dom';

export interface ChatContentProps {
    examples: string[];
    onApiError?: (data: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function AIChat({ examples, onApiError }: ChatContentProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [text, setText] = useState<string>('');
    const [dummyMessages, setDummyMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
    const textRef = useRef<HTMLTextAreaElement>(null);

    const onUseExample = (example: string) => {
        setText(example);
        focusElement(textRef.current);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        setDummyMessages((prev) => [...prev, { role: 'user', content: text }]);

        try {
            setIsLoading(true);

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();

            if (!response.ok) {
                onApiError?.(data);

                setDummyMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content:
                            'There was error generating the response.' + (data?.message ? ` (${data.message})` : ''),
                    },
                ]);
            } else {
                // Add the generated message to the conversation
                setDummyMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.message || 'AI asset generated successfully!' },
                ]);

                setText('');
                focusElement(textRef.current);
            }
        } catch (e) {
            // Handle any unexpected errors
            console.error('Error generating AI asset:', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute top-[48px] bottom-0 pb-[150px] w-full">
            <div className="flex flex-col items-center justify-center gap-4 pt-4">
                {/* Starter examples or the conversation */}
                {dummyMessages.length === 0 ? (
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-2xl font-semibold text-center mt-4">What can I help you with?</h3>
                        <div className="w-full pt-8">
                            <div className="grid gap-2 md:gap-3">
                                {examples.map((example) => (
                                    <Button
                                        key={example}
                                        type="button"
                                        variant="outline"
                                        onClick={() => onUseExample(example)}
                                        className="justify-start h-auto text-left whitespace-normal px-3 py-2 text-sm"
                                        aria-label={`Use example: ${example}`}
                                    >
                                        {example}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full pt-8 ">
                        <Conversation className="w-full absolute top-0 bottom-0">
                            <ConversationContent>
                                {dummyMessages.map((msg, index) => (
                                    <div className="max-w-4xl w-full mx-auto" key={index}>
                                        <Message from={msg.role}>
                                            <MessageContent>
                                                <Response>{msg.content}</Response>
                                            </MessageContent>
                                            <MessageAvatar name={msg.role === 'user' ? 'Me' : 'AI'} src="/" />
                                        </Message>
                                    </div>
                                ))}
                                {/* Placeholder for conversation scroll button accounting for the chat box */}
                                <div className="h-[150px]"></div>
                            </ConversationContent>
                            <ConversationScrollButton />
                        </Conversation>
                    </div>
                )}

                <div className="h-[150px] absolute bottom-0 w-full px-4 md:px-6 flex flex-col pb-0">
                    <div className="mt-auto mx-auto max-w-2xl w-full">
                        <div className="relative p-4 pb-0 bg-accent/40 backdrop-blur-md rounded-t-xl">
                            <PromptInput onSubmit={handleSubmit} className="relative rounded-t-lg border-b-0">
                                <PromptInputTextarea
                                    className="min-h-25"
                                    onChange={(e) => setText(e.target.value)}
                                    value={text}
                                    ref={textRef}
                                    disabled={isLoading}
                                />
                                <PromptInputToolbar>
                                    <PromptInputSubmit
                                        className="absolute right-1 bottom-1"
                                        disabled={isLoading || text.trim().length === 0}
                                        status={isLoading ? 'streaming' : 'ready'}
                                        aria-disabled={isLoading || text.trim().length === 0}
                                    />
                                </PromptInputToolbar>
                            </PromptInput>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
