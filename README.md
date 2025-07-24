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

## How to Use in Another Web App

This project has been refactored into a self-contained component (`<ExamWiseClient />`) that can be integrated into another Next.js or React-based web application.

Because the component depends on server-side AI flows and specific UI configurations, you must copy the necessary files into your target project.

1.  **Copy Project Files**: Copy the following directories from this project into your target project's `src` folder:
    *   `src/components`
    *   `src/ai`
    *   `src/lib`
    *   `src/types`
    *   `src/data`

2.  **Copy Server Actions**: Copy the `src/app/actions.ts` file into your project.

3.  **Merge `package.json`**: Add all the `dependencies` and `devDependencies` from this project's `package.json` file to your own and run `npm install`.

4.  **Merge Configuration**:
    *   Merge the settings from `tailwind.config.ts` into your project's Tailwind config.
    *   Copy the styles from `src/app/globals.css` into your project's global CSS file.
    *   Ensure your project has a `components.json` file for ShadCN UI, or copy this project's file.

5.  **Set Environment Variables**: Add your `GOOGLE_API_KEY` to your project's `.env` file.

6.  **Usage**: You can now import and use the main component in your application:

    ```jsx
    import ExamWiseClient from './path/to/components/exam-generator'; // Adjust path as needed

    function MyPage() {
      return <ExamWiseClient />;
    }
    ```

### Note on React Native

You **cannot** use this component directly in a React Native project. This application is built for the web (using HTML and CSS), while React Native uses different, platform-native UI components. To use this app's functionality in React Native, you would need to:
1.  Rebuild the user interface using React Native components (e.g., `<View>`, `<Text>`).
2.  Expose the backend Genkit flows as callable API endpoints that your React Native app can connect to.
```