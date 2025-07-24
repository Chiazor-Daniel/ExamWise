# ExamWise - AI Exam Prep Tool

This is an AI-powered exam preparation tool built with Next.js in Firebase Studio. It allows users to analyze past exam papers, identify key topics, and generate mock exams with AI assistance.

This document provides instructions for running the existing web application locally and a guide for developers on how to adapt this project to create a mobile application using React Native.

## Running the Web Application Locally

To run this project on your local machine, follow these steps:

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 2. Installation

First, install the project dependencies:

```bash
npm install
```

### 3. Set Up Environment Variables

This project uses Google's AI models. You'll need an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

1.  Create a new file named `.env` in the root of the project.
2.  Add your Google API key to the file:

```
GOOGLE_API_KEY=your_api_key_here
```

### 4. Run the Development Servers

You need to run two separate development servers in two separate terminal windows for the application to work correctly.

**Terminal 1: Run the Next.js App**

This command starts the user interface and web server.

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

**Terminal 2: Run the Genkit AI Flows**

This command starts the Genkit server, which handles all the AI-related tasks.

```bash
npm run genkit:watch
```

With both servers running, you can now use the application locally.

---

## Guide: Creating a Mobile Version with React Native

It is not possible to use the web components from this project directly in React Native. The web app is built with Next.js and HTML-based components, while React Native uses its own set of native UI components.

However, you **can** reuse the entire backend AI logic. The process involves two major parts: building a new React Native user interface and connecting it to the existing backend flows.

### Part 1: Expose the Backend AI Flows as an API

The existing Next.js server actions are already callable from the web client. To use them from a React Native app, you need to expose them as standard HTTP API endpoints.

1.  **Understand the Server Actions:** The file `src/app/actions.ts` contains all the functions that interact with the Genkit AI flows (e.g., `handleAnalyzePatterns`, `handleGenerateQuestions`). These are the functions your mobile app will need to call.

2.  **Create API Routes:** In your Next.js app, create API routes that wrap these server actions. For example, you could create a file `src/app/api/generate-exam/route.ts`:

    ```typescript
    // src/app/api/generate-exam/route.ts
    import { NextRequest, NextResponse } from 'next/server';
    import { handleGenerateQuestions } from '@/app/actions';

    export async function POST(request: NextRequest) {
      try {
        const body = await request.json(); // Contains subject, year, difficulty
        const result = await handleGenerateQuestions(body);

        if (result.success) {
          return NextResponse.json(result.data);
        } else {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
      } catch (error) {
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
      }
    }
    ```

3.  **Deploy the API**: Deploy this Next.js application to a hosting provider like Vercel or Firebase App Hosting. Once deployed, your API endpoints will be live and ready to be called from your mobile app (e.g., `https://your-app-url.com/api/generate-exam`).

### Part 2: Build the React Native User Interface

With the backend API in place, you can now build the mobile app UI from scratch using React Native components.

1.  **Set Up a React Native Project**: Start a new project using the React Native CLI or Expo.

2.  **Recreate UI Components**: Rebuild the user interface components (`ExamGenerator`, `SubjectManager`, `QuestionDisplay`, etc.) using React Native's core components:
    *   `<div>` becomes `<View>`
    *   `<p>`, `<h1>` become `<Text>`
    *   `<button>` becomes `<Button>` or `<TouchableOpacity>`
    *   `<input>` becomes `<TextInput>`
    *   File selection would require a library like `react-native-document-picker`.

3.  **Connect UI to the API**: Use a library like `fetch` or `axios` in your React Native app to make network requests to the API endpoints you deployed.

    **Example: Calling the Exam Generation API from React Native**

    ```javascript
    const generateExam = async (subject, year, difficulty) => {
      try {
        const response = await fetch('https://your-app-url.com/api/generate-exam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subject, year, difficulty }),
        });

        const data = await response.json();

        if (response.ok) {
          // Set the generated questions in your app's state
          setGeneratedExam(data);
        } else {
          // Handle a server error
          console.error(data.error);
        }
      } catch (error) {
        // Handle a network error
        console.error('Failed to connect to the server.');
      }
    };
    ```

By following this two-part approach, you can successfully build a native mobile app for iOS and Android that is powered by the same robust AI backend as your web application.
