## Capella Speech – Fluency Activities App

This app is developed by Capella Speech ([capella-speech.org](https://capella-speech.org)), a student-led organization raising awareness of speech impairments and curating resources for the community. Our goal with this app is to promote speech fluency for people who stutter through well-established practice activities and educational resources.

Important: This app is not a clinical tool and is not a substitute for professional evaluation or therapy. If you are seeking clinical care, please consult a licensed speech-language pathologist.

### What’s in the app

- **Choral Speaking**: Speak along with a reference voice to leverage the well-known choral speech effect, which can temporarily increase fluency for many people who stutter. You control the content and pacing.
- **Delayed Auditory Feedback (DAF)**: Hear your own voice with a short delay, a technique that can change speech rate and rhythm. The app provides adjustable delay settings.
- **Flashcards**: Practice structured word and phrase lists with adjustable prompts. Designed for repetition and gradual difficulty.
- **Paced Speaking (in progress)**: A metronome-like activity to encourage rhythmic speech pacing. Note: This activity is currently incomplete and may change.
- **Story Chain**: Collaborative storytelling that encourages longer utterances in a low-pressure format.
- **Resources**: Curated educational links and materials related to stuttering, therapy approaches, and community support.

Again, these activities are for education and practice only—they are not medical treatment.

### Project background

- The original Capella app was implemented in Swift for iOS.
- This repository is a newly updated rewrite in React Native (Expo) for cross-platform compatibility (iOS, Android, and web where feasible).
- On iOS, DAF uses a native audio module bridged to React Native for low-latency processing (see `ios/Capella/DAFModule.swift` and `native-modules/DAFModule.ts`).

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npx expo start
   ```

Then open the app in one of the following:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) (feature-limited, best for quick previews)

Project uses file-based routing; see the `app/` directory for screens and activities.

## Tech overview

- React Native (Expo), TypeScript
- Native iOS audio module for DAF (Swift, bridged through Objective‑C)
- Internationalization via `i18n/` with English and Chinese locales
- Assets under `assets/` including icons and word-bank data

## Contributing

Contributions are welcome. Please open an issue or pull request. By contributing, you agree that your contributions may be used under the project’s license.

## License

MIT
