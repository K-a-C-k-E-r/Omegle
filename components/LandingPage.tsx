'use client'

import { useState } from 'react'
import OnlineStats from './OnlineStats'

interface LandingPageProps {
    onStartChat: (interests: string[], findCommonInterests: boolean) => void
}

export default function LandingPage({ onStartChat }: LandingPageProps) {
    const [interests, setInterests] = useState<string[]>([])
    const [currentInterest, setCurrentInterest] = useState('')
    const [findCommonInterests, setFindCommonInterests] = useState(false)

    const addInterest = (interest: string) => {
        if (interest.trim() && !interests.includes(interest.trim())) {
            setInterests([...interests, interest.trim()])
            setCurrentInterest('')
        }
    }

    const removeInterest = (interest: string) => {
        setInterests(interests.filter(i => i !== interest))
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addInterest(currentInterest)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">

                {/* Online Stats */}
                <OnlineStats />

                {/* Safety Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">The Safety Thing (For Real Though)</h2>

                    <p className="text-gray-700 mb-4">
                        We're not gonna lie - the original Omegle had... issues. That's why we built this with AI monitoring,
                        human mods watching streams, fake webcam detection, and instant reporting. Still anonymous and spontaneous,
                        just way less Wild West energy. Our community guidelines aren't just there for show - we actually enforce them.
                    </p>

                    <p className="text-gray-700 mb-4">
                        Thousands of people use OmegleWeb daily to meet strangers without the sketch factor. No registration,
                        no app download, just instant connections with way better safety. Ready to actually{' '}
                        <strong>talk to strangers</strong> without worrying about weirdos? Let's go.
                    </p>

                    <p className="text-sm text-gray-600 mb-2">
                        <strong>BY USING THIS SERVICE, YOU MUST AGREE TO OUR TERMS AND CONDITIONS.</strong>{' '}
                        See Omegle's{' '}
                        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{' '}
                        for more info. Parental control protections that may assist parents are commercially available and you can find more info at{' '}
                        <a href="https://www.connectsafely.org/controls/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            https://www.connectsafely.org/controls/
                        </a>{' '}
                        as well as other sites.
                    </p>
                </div>

                {/* Chat Options Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-lg font-semibold text-gray-800">
                            ⚠️ Chats are monitored. Keep it clean
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Interests Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">What do you wanna talk about?</h3>

                            <div className="mb-3 text-black">
                                <input
                                    type="text"
                                    value={currentInterest}
                                    onChange={(e) => setCurrentInterest(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Add interests (press Enter)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {interests.map((interest, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {interest}
                                        <button
                                            onClick={() => removeInterest(interest)}
                                            className="hover:text-red-200 font-bold"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={findCommonInterests}
                                    onChange={(e) => setFindCommonInterests(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Find strangers with common interests</span>
                            </label>
                        </div>

                        {/* Start Chatting Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Start chatting:</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={() => onStartChat(interests, findCommonInterests)}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition text-lg shadow-lg"
                                >
                                    Text
                                </button>

                                <div className="text-center text-gray-500 font-semibold">or</div>

                                <button
                                    disabled
                                    className="w-full bg-gray-300 text-gray-500 font-bold py-4 px-6 rounded-lg cursor-not-allowed text-lg"
                                >
                                    Video
                                </button>

                                <button
                                    disabled
                                    className="w-full bg-gray-200 text-gray-400 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
                                >
                                    Video (Unmonitored)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4">▼ Frequently Asked Questions (FAQs)</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Wait, is this actually free?</h3>
                            <p className="text-gray-700">
                                Yup. 100% free! No credit card, no subscription BS, no "free trial" that charges you later.
                                Just pure random chat vibes whenever you want.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-2">How does the matching work?</h3>
                            <p className="text-gray-700">
                                We randomly pair you with another person who's online. If you added interests, we'll try to
                                match you with someone who shares similar interests. Otherwise, it's completely random!
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-2">Is this safe?</h3>
                            <p className="text-gray-700">
                                We take safety seriously. While no chat platform can be 100% safe, we have AI monitoring,
                                human moderators, and reporting features. Always be cautious about sharing personal information
                                and report any inappropriate behavior immediately.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-2">Can I choose who I talk to?</h3>
                            <p className="text-gray-700">
                                Nope! That's the whole point - random conversations with strangers. But you can skip to the
                                next person anytime by clicking "New" if the conversation isn't your vibe.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-2">Do I need to register?</h3>
                            <p className="text-gray-700">
                                No registration required! Just click "Text" and you're good to go. We keep it simple and anonymous.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>© 2024 Omegle. All rights reserved.</p>
                    <p className="mt-2">
                        <a href="#" className="hover:underline mx-2">Privacy Policy</a> |
                        <a href="#" className="hover:underline mx-2">Terms of Service</a> |
                        <a href="#" className="hover:underline mx-2">Community Guidelines</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
