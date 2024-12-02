# Driveway Sealing Management System

## Table of Contents
- [Project Overview](#project-overview)
- [System Requirements](#system-requirements)
- [Database Design](#database-design)
  - [ER Design](#er-design)
  - [Relational Model](#relational-model)
- [Functionalities](#functionalities)
  - [Dashboard for David Smith](#dashboard-for-david-smith)
  - [Dashboard for Clients](#dashboard-for-clients)
  - [Additional Functionalities](#additional-functionalities)
- [Queries](#queries)
  - [Big Clients](#big-clients)
  - [Difficult Clients](#difficult-clients)
  - [This Month's Quotes](#this-months-quotes)
  - [Prospective Clients](#prospective-clients)
  - [Largest Driveway](#largest-driveway)
  - [Overdue Bills](#overdue-bills)
  - [Bad Clients](#bad-clients)
  - [Good Clients](#good-clients)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Project Demonstration](#project-demonstration)


## Project Overview  

This project is a web-based driveway-sealing management system for a contractor, David Smith. It allows clients to request quotes for driveway sealing services, negotiate terms, and manage billing. The system facilitates a seamless negotiation process, allowing both David Smith and clients to interact through dashboards.

## System Requirements

* Web-based interface (HTML/CSS/JavaScript)
* Backend Server (Node.js, Express)
* Database (MySQL)

## Database Design

### ER Diagram
The Entity-Relationship (ER) diagram models the structure of the database, identifying key entities such as Client, Quote Request, Order of Work, Bill, and Responses.

### Relational Model
Create a database on PHPmyadmin called web_app.
Below is the set of CREATE TABLE statements to implement the database:
```sql
CREATE TABLE Client (
    client_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    credit_card_info VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE QuoteRequest (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    property_address TEXT NOT NULL,
    driveway_sqft INT NOT NULL,
    proposed_price DECIMAL(10, 2),
    note TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (client_id) REFERENCES Client(client_id)
);

CREATE TABLE QuoteRequestImage (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (request_id) REFERENCES QuoteRequest(request_id)
);

CREATE TABLE QuoteResponse (
    response_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    response_price DECIMAL(10, 2),
    work_start_date DATE,
    work_end_date DATE,
    response_note TEXT,
    response_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (request_id) REFERENCES QuoteRequest(request_id)
);

CREATE TABLE OrderOfWork (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    quote_response_id INT NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Ongoing',
    FOREIGN KEY (client_id) REFERENCES Client(client_id),
    FOREIGN KEY (quote_response_id) REFERENCES QuoteResponse(response_id)
);

CREATE TABLE Bill (
    bill_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    client_id INT NOT NULL,
    bill_amount DECIMAL(10, 2),
    bill_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (order_id) REFERENCES OrderOfWork(order_id),
    FOREIGN KEY (client_id) REFERENCES Client(client_id)
);

CREATE TABLE BillResponse (
    response_id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id INT NOT NULL,
    response_note TEXT,
    response_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (bill_id) REFERENCES Bill(bill_id)
);
```
## Functionalities

### Dashboard for David Smith
1. View Requests: Access all incoming quote requests, including details like property address, square footage, proposed price, and images.
2. Quote Responses: Respond to quote requests with price adjustments, scheduling, or rejection notes.
3. Order Management: Track orders of work, view status, and finalize orders.
4. Billing Management: Generate, send, and respond to bills.
5. Revenue Report: Generate reports for revenue over a specified period.

### Dashboard for Clients
1. View Quotes: Access quote details and response status.
2. Request Modifications: Negotiate on received quotes with counter-offers.
3. Order Tracking: View details of accepted orders.
4. Bill Payment: Pay bills or dispute them with comments.

### Additional Functionalities
* Negotiation Tracking: All quote and bill negotiations are tracked, providing evidence in case of disputes.
* Notification System: Real-time notifications for responses and updates.

## Queries

### Big Clients
List clients with the highest number of completed orders.

### Difficult Clients
List clients who submitted three requests without following up.

### This Month's Quotes
List all quotes agreed upon in the current month (e.g., November 2024).

### Prospective Clients
List registered clients who never submitted any request for quotes.

### Largest Driveway
Find the largest driveway (by square footage) that has been serviced.

### Overdue Bills
List bills that have not been paid a week after generation.

### Bad Clients
Identify clients who never paid any overdue bills.

### Good Clients
Identify clients who paid their bills within 24 hours of bill generation.

## Installation

1. Clone the repository:
```
git clone https://github.com/SabaBegum2/driveway-sealing-management-system.git
```
2. Install dependencies:
```bash
npm install
```
3. Set up the database using the provided CREATE TABLE statements.
4. Configure the database connection in the .env file.
5. Run the server:
```bash
npm start
```
## Usage
1. Open a web browser and go to http://localhost:5050.
2. Log in as David Smith or as a client.
3. Use the dashboard to manage quotes, orders, and billing.
   
## Screenshots
Include relevant screenshots of the interface here.

## Project Demonstration
Work in Progress.

