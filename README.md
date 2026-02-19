# Oraculum

Oraculum is a modern web application built with Next.js and Supabase. It leverages the power of Google's Generative AI to provide a unique and interactive user experience.

## Features

- **User Authentication:** Secure user registration and login functionality.
- **Post Management:** Create, view, and search for posts.
- **Interactive Q&A:** Create and list answers and replies to posts.
- **Voting System:** Upvote or downvote posts.
- **Personalized Recommendations:** Get post recommendations.
- **User Profiles:** View and manage user profiles.
- **Notifications:** Receive and manage notifications.
- **Theme Customization:** Switch between light and dark modes.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v20 or later)
- npm

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username/oraculum.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Setup your Supabase and Google Generative AI credentials in a `.env.local` file.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in the development mode.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the code.

## Dependencies

- **Next.js:** A React framework for building server-side rendered and static web applications.
- **Supabase:** An open source Firebase alternative for building secure and scalable backends.
- **Radix UI:** A collection of low-level UI components for building high-quality design systems.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Google Generative AI:** Google's powerful AI models for generating content.
- **Lucide React:** A library of beautiful and consistent icons.

## Project Structure

The project follows a standard Next.js `app` directory structure.

```
/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   └── utils/
└── ...
```

- **`src/app/api`**: Contains all the API routes for the application.
- **`src/app/dashboard`**: Contains the pages for the user dashboard.
- **`src/components`**: Contains all the reusable UI components.
- **`src/lib`**: Contains utility functions and libraries.
- **`src/utils`**: Contains utility functions, including Supabase client and middleware.
- **`public`**: Contains all the static assets.