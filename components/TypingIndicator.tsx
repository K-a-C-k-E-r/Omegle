'use client'

export default function TypingIndicator() {
    return (
        <div className="flex justify-start mb-3">
            <div className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                <p className="text-xs font-semibold mb-1">Stranger</p>
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    )
}
