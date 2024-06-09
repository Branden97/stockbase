# stockbase

A real-time stock market dashboard built with Node.js, React.js, and SQL. Created as a take-home assignment for Truckbase, it features real-time stock updates, watchlist management, and robust error handling.

<details>
  <summary><h2>Features Checklist</h2></summary>
  
### Required Features
#### Backend (Node.js)
- [ ] RESTful API
    - [ ] fetch current stock prices
    - [ ] add new stocks to watchlist (must be SQL DB)
        - [ ] design the schema
    - [ ] Real-Time data streaming of stock price updates
- [ ] SQL DB
    - [ ] Database Schema: Write a SQL query to create the necessary table(s) for the watchlist
Include fields like stock symbol, added timestamp, etc
    - [ ] Data Retrieval: Write a SQL query to fetch the list of stocks from the watchlist


#### Frontend (React.js)
- [ ] Stock Dashboard: simple UI to display stock prices
- [ ] Watchlist Management: users can add stocks to their watchlist
- [ ] Error Handling: Implement basic error handling
- [ ] User Feedback: Provide feedback for user actions (e.g., adding a stock to the watchlist)

#### Additional Requirements
- [ ] Include a README file with clear instructions on how to set up and run the application
- [ ] Write clean, modular, and well-documented code
- [ ] Ensure the application is robust and handles edge cases gracefully
- [ ] Bonus points for implementing user management

#### Evaluation Criteria
- Code organization and clarity
- Correct implementation of RESTful principles and WebSocket/polling mechanism
- Effective use of SQL for data storage and retrieval
- Functionality of the React.js frontend, including real-time updates
- Error handling and user experience considerations


#### Above and Beyond (Not part of original requirements)
- [ ] Landing Page
- [ ] Fully-functional Auth mechanisms
- [ ] API Schema
- [ ] API Docs
- [ ] Responsive mobile design

</details>

## Honorable Mentions:

- This Monorepo was bootstrapped using : [vercel/turbo](https://vercel.com/templates/remix/turborepo-kitchensink)