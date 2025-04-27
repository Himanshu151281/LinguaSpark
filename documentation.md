# Text 
text : https://console.groq.com/docs/text-chat
model id : meta-llama/llama-4-maverick-17b-128e-instruct

# Speech to Text
speech to text : https://console.groq.com/docs/speech-to-text
model id : whisper-large-v3-turbo

# Text to Speech
text to speech : https://console.groq.com/docs/text-to-speech
model id : playai-tts

# Reasoning
reasoning : https://console.groq.com/docs/reasoning
model id : deepseek-r1-distill-llama-70b

# Vision
vision : https://console.groq.com/docs/vision
model id : meta-llama/llama-4-maverick-17b-128e-instruct

## Implementation Log

### 2025-04-26
- Created `src/lib/groqClient.ts` with Groq API wrappers:
  - `chatCompletion` (model: meta-llama/llama-4-maverick-17b-128e-instruct)
  - `transcribeAudio` (model: whisper-large-v3-turbo)
  - `synthesizeSpeech` (model: playai-tts)
  - `reasoning` (model: deepseek-r1-distill-llama-70b)
  - `visionAnalyze`
- Started development server (`npm run dev`) to verify integration.
- Integrated `chatCompletion` in `src/components/ConversationPractice.tsx`: imported Groq client and replaced simulated AI responses with real API calls using the payload mapping.
- Exported `Message` interface in `src/lib/groqClient.ts` to enable TS typing.
- Implemented `toggleTranslation` in ConversationPractice: uses `chatCompletion` to translate AI/user messages on demand.
- Implemented `toggleRecording` in ConversationPractice: records audio via MediaRecorder, calls `transcribeAudio` to populate user input.
- Integrated TTS playback using `synthesizeSpeech` in ConversationPractice to play AI responses.
- Added loading state (`isLoading`) with spinner on Send button during chat API calls in ConversationPractice.
- Added translation loading indicators (`translatingIds`) with spinner on translation toggles.
- Added dynamic Lesson Hub content generation in `LessonHubPage`: chatCompletion API to generate lesson passages and questions, with loading spinner and modal view.
- Enhanced Onboarding flow: added proficiency assessment, personalized learning path, tutorial steps with chatCompletion and spinners.
- Added AI Recommendations card to `DashboardPage`: fetches custom activity suggestions from Groq chatCompletion with loading spinner.
- Added dynamic quiz generation in `QuizPage`: chatCompletion API to create multiple-choice questions on load with loading spinner and instant feedback handling.
- Enhanced Typing Test: AI-generated practice passages per difficulty via chatCompletion, with loading spinner and dynamic reset on difficulty switch.
- Integrated vocabulary extraction in `SongLyricsPage`: fetches key words via chatCompletion on song select, displays list with loader.
- Enhanced Story Generator: dynamic branching with AI-generated continuation options in `StoryGeneratorPage`, including loader on generation and selectable choices to extend the story.
- Integrated AI-assisted dialogue suggestions in `ComicCreatorPage`: fetches context-based character lines via chatCompletion per panel, shows a loader, and allows clicking suggestions to populate dialogue fields.