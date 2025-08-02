# ExamWise - AI Exam Prep Tool

This project is a Next.js application that provides an AI-powered backend for exam preparation. It can analyze past exam papers, generate mock exams, and provide detailed solutions. This document serves as a guide for mobile developers who want to build a native mobile application (e.g., using React Native) that consumes the API provided by this backend.

## Running the Backend Locally

To run this backend on your local machine, you must have it deployed or follow these steps:

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

You need to run two separate development servers for the backend to work correctly.

**Terminal 1: Run the Next.js API Server**

This command starts the web server that hosts the API endpoints.

```bash
npm run dev
```

The API will be available at `http://localhost:9002`.

**Terminal 2: Run the Genkit AI Flows**

This command starts the Genkit server, which handles all the AI-related tasks.

```bash
npm run genkit:watch
```

With both servers running, the API is ready to be called from your mobile app.

---

## Testing with cURL

You can test the API endpoints using `cURL` from your terminal. Replace `https://class-fi.vercel.app` with your Vercel URL if it changes.

**1. Get Available Subjects**
```bash
curl https://class-fi.vercel.app/api/subjects
```

**2. Get Analysis for a Subject**
```bash
# Replace "Physics" with the desired subject name
curl https://class-fi.vercel.app/api/subjects/Physics
```

**3. Generate Exam Questions**
```bash
curl -X POST https://class-fi.vercel.app/api/generate-questions \
-H "Content-Type: application/json" \
-d '{
  "subject": "Physics",
  "year": 2025,
  "difficulty": "Hard"
}'
```

**4. Solve a Question**
```bash
curl -X POST https://class-fi.vercel.app/api/solve-question \
-H "Content-Type: application/json" \
-d '{
  "question": "What is the formula for calculating kinetic energy?",
  "options": ["m*g*h", "1/2 * m * v^2", "m*a", "p*V"],
  "correctAnswer": "1/2 * m * v^2"
}'
```

**5. Generate Audio Explanation**
```bash
curl -X POST https://class-fi.vercel.app/api/generate-audio \
-H "Content-Type: application/json" \
-d '{
  "explanation": "The correct answer is Paris because it is the capital city of France."
}'
```

---

## Guide for Mobile App Development (React Native)

You can build a native mobile app for iOS and Android that is powered by this backend. The mobile app will be responsible for the entire user interface, while this project provides the data and AI capabilities through a simple REST API.

### API Endpoints

Once deployed, your API will be available at your Vercel URL: `https://class-fi.vercel.app`.

---

#### 1. Get Available Subjects

- **Endpoint**: `GET /api/subjects`
- **Description**: Fetches a list of all subjects that have pre-analyzed data available.
- **Example Call (React Native)**:
  ```javascript
  const fetchSubjects = async () => {
    try {
      const response = await fetch('https://class-fi.vercel.app/api/subjects');
      const subjects = await response.json();
      // Returns: ["Physics", "Biology", "Chemistry", ...]
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };
  ```

---

#### 2. Get Analysis for a Subject

- **Endpoint**: `GET /api/subjects/{subjectName}`
- **Description**: Retrieves the detailed analysis for a specific subject.
- **Example Call (React Native)**:
  ```javascript
  const fetchAnalysis = async (subject) => {
    try {
      const response = await fetch(`https://class-fi.vercel.app/api/subjects/${subject}`);
      const analysis = await response.json();
      // `analysis` will contain frequentTopics, questionPatterns, etc.
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    }
  };
  ```

---

#### 3. Generate Exam Questions

- **Endpoint**: `POST /api/generate-questions`
- **Description**: Generates a new mock exam based on a subject, year, and difficulty.
- **Request Body (JSON)**:
  ```json
  {
    "subject": "Physics",
    "year": 2025,
    "difficulty": "Hard"
  }
  ```
- **Example Call (React Native)**:
  ```javascript
  const generateExam = async (subject, year, difficulty) => {
    try {
      const response = await fetch('https://class-fi.vercel.app/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, year, difficulty }),
      });
      const examData = await response.json();
      // `examData` will contain an array of questions
      setGeneratedExam(examData.questions);
    } catch (error) {
      console.error('Failed to generate exam:', error);
    }
  };
  ```

---

#### 4. Solve a Question

- **Endpoint**: `POST /api/solve-question`
- **Description**: Gets a detailed, AI-powered explanation for a specific question.
- **Request Body (JSON)**:
  ```json
  {
    "question": "What is the capital of France?",
    "options": ["Berlin", "Madrid", "Paris", "Rome"],
    "correctAnswer": "Paris"
  }
  ```
- **Example Call (React Native)**:
  ```javascript
  const getSolution = async (question) => {
    try {
      const response = await fetch('https://class-fi.vercel.app/api/solve-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer
        }),
      });
      const solution = await response.json();
      // `solution` will contain the text explanation
      setSolution(solution.explanation);
    } catch (error) {
      console.error('Failed to get solution:', error);
    }
  };
  ```

---

#### 5. Generate Audio Explanation

- **Endpoint**: `POST /api/generate-audio`
- **Description**: Converts an explanation text into speech.
- **Request Body (JSON)**:
  ```json
  {
    "explanation": "The correct answer is Paris because it is the capital city of France."
  }
  ```
- **Response Note**: The API will return a JSON object with a single key, `audioDataUri`. The value of this key is a very long string, which is the entire audio file encoded in [base64 format](https://developer.mozilla.org/en-US/docs/Glossary/Base64). This is the expected behavior. Your mobile app can play this audio directly.

- **Example Call (React Native)**:
  ```javascript
  const getAudio = async (text) => {
    try {
      const response = await fetch('https://class-fi.vercel.app/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ explanation: text }),
      });
      const audioData = await response.json();
      // `audioData.audioDataUri` is a base64 data URI you can use
      // with a library like 'react-native-sound' or 'expo-av'.
      
      // Example with expo-av:
      // const { sound } = await Audio.Sound.createAsync({ uri: audioData.audioDataUri });
      // await sound.playAsync();

      playAudio(audioData.audioDataUri);
    } catch (error) {
      console.error('Failed to generate audio:', error);
    }
  };
  ```

By calling these endpoints, you can build a full-featured native mobile experience powered by this robust AI backend.
