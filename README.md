# stockbase

A real-time stock market dashboard built with Node.js, React.js, and SQL. Created as a take-home assignment for Truckbase, it features real-time stock updates, ~~watchlist management~~ (coming soon! Just gotta implement it in the UI), and robust error handling.

<details open>
  <summary><h2>Features Checklist</h2></summary>
  
### Required Features
#### Backend (Node.js)
- [x] RESTful API
    - [x] fetch current stock prices
    - [x] add new stocks to watchlist (must be SQL DB)
        - [x] design the schema
    - [x] Real-Time data streaming of stock price updates (websockets or polling)
- [x] SQL DB
    - [x] Database Schema: Write a SQL query to create the necessary table(s) for the watchlist
Include fields like stock symbol, added timestamp, etc
    - [x] Data Retrieval: Write a SQL query to fetch the list of stocks from the watchlist
        (I used the sequelize ORM, but I can write the raw sql query by hand if needed.)


#### Frontend (React.js)
- [x] Stock Dashboard: simple UI to display stock prices
- [ ] Watchlist Management: users can add stocks to their watchlist
    (Coming soon!)
- [x] Error Handling: Implement basic error handling
- [ ] User Feedback: Provide feedback for user actions (e.g., adding a stock to the watchlist)
    (Coming soon!)

#### Additional Requirements
- [x] Include a README file with clear instructions on how to set up and run the application
- [x] Write clean, modular, and well-documented code
- [x] Ensure the application is robust and handles edge cases gracefully
- [ ] Bonus points for implementing user management
    (Coming soon! - And does updating name, username, email, or password count?)

#### Evaluation Criteria
- Code organization and clarity
- Correct implementation of RESTful principles and WebSocket/polling mechanism
- Effective use of SQL for data storage and retrieval
- Functionality of the React.js frontend, including real-time updates
- Error handling and user experience considerations


#### Above and Beyond (Not part of original requirements)
- [ ] Landing Page (Coming soon!)
- [x] Fully-functional Auth mechanisms
- [x] API Schema
- [x] API Docs
- [ ] Responsive mobile design (Coming soon!)
    (Mostly responsive. Some things need work, though.)
- [ ] Add badges to the Readme (Coming soon!)
- [ ] A/B Testing for RESTful API vs. Next.js React Server Components (Coming soon!)

</details>

<details open>
  <summary><h2>Installation</h2></summary>

### Prerequisites
To quickly spin it up and see it in action, simply:
1. Make sure you have [Docker](https://www.docker.com/) installed on your system
2. Just run this, and grab a cup of coffee ☕
    ```bash
    source .env.template; docker-compose up
    ```
    This spins up `postgres` & `redis` containers, and builds and starts containers for the `frontend`, `api`, and `worker`
3. After a few minutes of stuff building, you shold be able to navigate to [http://localhost/stocks](http://localhost/stocks)

The frontend still needs a lot of work - I spent most of my time on the backend.

</details>


<details open>
  <summary><h2>Development</h2></summary>
    
### Prerequisites
Before you start the development process, make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (version 20 or higher)
- [pnpm](https://pnpm.io/) (a fast package manager for Node.js)

### Setting up the Development Environment
1. Clone the repository:
     ```bash
     git clone https://github.com/branden97/stockbase.git
     ```

2. Install project dependencies using pnpm:
     ```bash
     cd stockbase
     npm i -g pnpm # install pnpm if it's not already
     pnpm install
     ```

3. Create `.env` files in the following directories and configure the environment variables:
     - `apps/api/.env`
        ```bash
        cp .env.template .env
        cp apps/api/.env.template apps/api/.env
        cp packages/db/.env.template packages/db/.env
        ```

4. Start PostgreSQL and Redis containers using Docker:
     ```bash
     source packages/db/.env
     export POSTGRES_PORT=${POSTGRES_PORT:-5432}

     # Start redis container
     docker run -d --name stockbase-redis -p 6379:6379 redis

     # Start postgres container
     docker run -e POSTGRES_USER=$POSTGRES_USERNAME -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -e POSTGRES_DB=$POSTGRES_DATABASE -p ${POSTGRES_PORT:-5432}:5432 --name stockbase-db -d postgres
     ```

5. Run database migrations to create the necessary tables:
     ```bash
     cd packages/db; pnpm run migrate:up; cd ../..
     ```

6. From the root of the repo, start the various apps in dev mode:
     ```bash
     turbo dev --filter="api" --filter="stockbase" --filter="worker"
     ```
     For the best developer experience, include the other packages in the `turbo dev` command so any changes to those packages' files trigger a rebuild.
     ```bash
     --filter="@repo/db" --filter="@repo/api-spec" 
     ```

### Accessing the Application
Once the development server is running, you can access the application by opening your browser and navigating to [http://localhost:3002](http://localhost:3002).
</details>

> [!NOTE]
> If you're getting a `Cannot find module '@repo/ui'` (or similar) error in vscode, run `pnpm run dev`. It will generate the `dist/**/*.d.ts` type files, which fixed the issue for me. [[more info]](https://github.com/vercel/turbo/issues/4771)

## Honorable Mentions:

- This Monorepo was bootstrapped using : [vercel/turbo](https://vercel.com/templates/remix/turborepo-kitchensink)
