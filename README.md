# ExamWise

This is an AI-powered exam preparation tool built with Next.js in Firebase Studio.

## Running Locally

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
