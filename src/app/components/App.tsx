"use client";
import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";

export default function App() {
    type Message = { sender: string; text: string; loading?: boolean };
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

    useEffect(() => {
        // Auto-scroll to the latest message
        chatContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    async function GPTFunction(input: string) {
        try {
            if (input.trim() === "") {
                alert("Input cannot be empty!");
                return;
            }

            setLoading(true);
            setMessages(prev => [
                ...prev,
                { sender: "You", text: input },
                { sender: "AI", text: "⏳ Generating response...", loading: true }
            ]);
            setInputValue("");

            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: input,
            });

            const generatedResponse = response.text || "";
            setMessages(prev =>
                [...prev.filter(msg => !msg.loading), { sender: "AI", text: parseBoldText(generatedResponse) }]
            );
        } catch (error) {
            console.error("Error: ", error);
            setMessages(prev =>
                [...prev.filter(msg => !msg.loading), { sender: "AI", text: "❌ An error occurred while processing your request." }]
            );
        } finally {
            setLoading(false);
        }
    }

    async function sendResponse() {
        await GPTFunction(inputValue);
    }

    function parseBoldText(text: string): string {
        return text
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Convert **bold** to <b>
            .replace(/\n/g, "<br>") // Preserve new lines
            .replace(/ {2,}/g, "&nbsp;&nbsp;"); // Preserve extra spaces
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-lg font-semibold">MyGeminiGPT</h1>
            <p className="text-lg text-gray-600">Your own GPT for all of your questions</p>

            {/* Chat Container */}
            <div className="mt-3 w-full h-[530px] bg-[#191919] rounded-lg p-4 overflow-y-auto shadow-md" ref={chatContainerRef}>
                {messages.length === 0 ? (
                    <p className="text-gray-400">Start a conversation...</p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`mb-2 p-2 rounded-lg ${msg.sender === "You" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}>
                            <strong>{msg.sender}: </strong>
                            <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                        </div>
                    ))
                )}

            </div>


            {/* Input and Send Button */}
            <div className="flex mt-4 bg-gray-800 items-center p-3 rounded-lg w-full mx-auto">
                <input
                    type="text"
                    placeholder="Ask Anything"
                    className="flex-1 p-2 rounded-lg bg-gray-700 text-white outline-none"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && sendResponse()}
                />
                <button
                    className="text-white hover:bg-red-700 ml-2 px-4 py-2 bg-red-600 rounded-lg disabled:opacity-50"
                    onClick={sendResponse}
                    disabled={loading}
                >
                    Send
                </button>
            </div>

        </div>
    );
}

