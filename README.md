# Advanced Human Resource Management System (HRMS)

A full-stack Human Resource Management System built with the MERN stack (MongoDB, Express, React, Node.js). This system is designed to streamline HR processes, including employee attendance tracking, leave management, payroll processing, and employee profile administration.

## Features

*   **Role-Based Access Control:** Distinct dashboards and permissions for Employees and HR/Admins.
*   **Attendance Tracking:** Employees can clock in/out daily. Automated calculation of working hours and extra hours. Admins have a bird's eye view of all employee attendance.
*   **Leave & Time-off Management:** Employees can apply for sick, casual, annual, or unpaid leave. Admins can review, approve, or reject leave requests.
*   **Payroll Processing:** Automated salary slip generation based on base salary, working days, deductions, and bonuses.
*   **Employee Profiles:** Detailed profiles containing employee information, designation, and department details.
*   **Beautiful UI:** A modern, fully responsive dashboard built with React and custom CSS styling.

## Technology Stack

*   **Frontend:** React.js, Vite, React Router DOM, React Hot Toast (for notifications), Lucide React (for icons)
*   **Backend:** Node.js, Express.js, Mongoose (MongoDB ODM)
*   **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing

## Getting Started

### Prerequisites

*   Node.js (v16 or higher)
*   MongoDB (Local instance or MongoDB Atlas cluster)

### Installation

1.  **Clone the repository**
2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```
3.  **Install Frontend Dependencies**
    ```bash
    cd frontend
    npm install
    ```

### Environment Variables

Create a `.env` file in the `backend` directory and add the following variables:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Running the Application

1.  **Start the Backend Server**
    ```bash
    cd backend
    npm run dev
    ```
2.  **Start the Frontend Development Server**
    ```bash
    cd frontend
    npm run dev
    ```

The frontend will run on `http://localhost:5173` and the backend API will run on `http://localhost:8000`.

## Project Structure

*   `/backend`: Contains the Express server, Mongoose models, controllers, and API routes.
*   `/frontend`: Contains the React application, UI components, and API integration logic.

## Modules Overview

1.  **Dashboard:** High-level summary of employee statistics and recent activities.
2.  **Profile:** Manage personal and professional details.
3.  **Attendance:** Check-in/out functionality and historical attendance logs.
4.  **Leave & Time-off:** Leave application form and approval workflow.
5.  **Payroll:** Salary configuration and monthly payslip generation.
