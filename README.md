 # Parcel Management System

A web-based Parcel Management System designed to simplify parcel booking, payment, tracking, delivery management, and parcel history.

# Features

Customer
- Customer registration and login
- Book a parcel
- Enter sender and receiver details
- Calculate parcel charges
- Make payment
- Generate invoice
- Track parcel status
- View parcel booking history
- Logout

 Officer
- Officer login
- View and manage parcel bookings
- Update parcel status
- Track parcel delivery
- View customer and parcel details
- Manage parcel history

Technologies Used

Frontend

- HTML5
- CSS3
- JavaScript

Backend

- Java
- Spring Boot
- REST APIs

Database

- MySQL

Tools

- Visual Studio Code
- Git & GitHub



# Main Modules

- Login & Registration – Handles customer and officer authentication.
- Home – Provides role-based navigation.
- Booking – Allows customers to book parcels by entering sender and receiver details.
- Payment – Handles parcel payment details.
- Invoice – Displays booking and payment information.
- Tracking – Allows users to check the current parcel status.
- History – Displays previous parcel bookings and delivery information.
- Shared – Contains common components such as navigation and helper functions.

# How to Run

Frontend

1. Clone the repository.

git clone <your-github-repository-url>

2. Open the "frontend" folder in Visual Studio Code.
3. Open "index.html" using Live Server.

Backend

1. Open the "backend" folder in Spring Tool Suite, IntelliJ IDEA, or Eclipse.
2. Configure the database connection in "application.properties".
3. Start the Spring Boot application.
4. The backend APIs can then be accessed by the frontend.

 # Frontend & Backend

The frontend communicates with the Spring Boot backend through REST APIs for operations such as:

- Customer registration and login
- Parcel booking
- Payment details
- Parcel tracking
- Parcel history
- Officer parcel management

# Objective

The main objective of this project is to provide a simple and organized system for managing the complete parcel booking and delivery process, from booking to tracking and maintaining parcel history.

