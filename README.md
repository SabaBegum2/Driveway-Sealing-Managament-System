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
CREATE TABLE ClientDB (
    clientID VARCHAR(20) PRIMARY KEY,
    email VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(20) NOT NULL,
    firstName VARCHAR(20) NOT NULL,
    lastName VARCHAR(20) NOT NULL,
    phoneNumber VARCHAR(10),
    creditCardNum VARCHAR(16),
    creditCardCVV VARCHAR(3),
    creditCardExp VARCHAR(5),
    homeAddress VARCHAR(60) NOT NULL,
    registerDate DATETIME,
    loginTime DATETIME,
    activeStatus ENUM("online","offline") DEFAULT "offline"
);

CREATE TABLE QuoteRequest (
    quoteID INT AUTO_INCREMENT,
    clientID VARCHAR(20),
    propertyAddress TEXT NOT NULL,
    drivewaySqft INT,
    proposedPrice DECIMAL(10, 2) NOT NULL,
    addNote VARCHAR(300),
    PRIMARY KEY (quoteID),
    FOREIGN KEY (clientID) REFERENCES ClientDB(clientID)
);

CREATE TABLE QuoteRequestImage (
    quoteID INT,
    image1 VARCHAR(255) NOT NULL,
    image2 VARCHAR(255) NOT NULL,
    image3 VARCHAR(255) NOT NULL,
    image4 VARCHAR(255) NOT NULL,
    image5 VARCHAR(255) NOT NULL,
    FOREIGN KEY (quoteID) REFERENCES QuoteRequest(quoteID)
);


CREATE TRIGGER `addToQuoteHistory` AFTER INSERT ON `QuoteRequest`
 FOR EACH ROW BEGIN
    -- Insert into QuoteHistory only if the quoteID is not already there
    IF NOT EXISTS (
        SELECT 1 
        FROM QuoteHistory 
        WHERE quoteID = NEW.quoteID
    ) THEN
        INSERT INTO QuoteHistory (clientID, quoteID, proposedPrice, addNote, status)
        VALUES (NEW.clientID, NEW.quoteID, NEW.proposedPrice, NEW.addNote, 'Pending');
    END IF;
END


CREATE TABLE QuoteHistory (
    responseID INT AUTO_INCREMENT,
    clientID VARCHAR(20),
    quoteID INT,
    proposedPrice DECIMAL(10, 2),
    startDate DATE,
    endDate DATE,
    addNote VARCHAR(300),
    responseDATE DATE DEFAULT CURRENT_DATE,
    status ENUM('Pending', 'Rejected', 'Accepted', 'Cancelled') DEFAULT 'Pending',
    PRIMARY KEY (responseID),
    FOREIGN KEY (quoteID) REFERENCES QuoteRequest(quoteID),
    FOREIGN KEY (clientID) REFERENCES QuoteRequest(clientID)
);


CREATE TRIGGER `createWorkOrder` AFTER UPDATE ON `QuoteHistory`
FOR EACH ROW
  BEGIN
    IF NEW.status = 'Accepted' THEN
      INSERT INTO WorkOrder( clientID, quoteID, responseID, dateRange)
VALUES(NEW.clientID, NEW.quoteID, NEW.responseID, CONCAT(NEW.startDate, ' to ', NEW.endDate));
    END IF;
END


CREATE TABLE WorkOrder (
    workOrderID INT PRIMARY KEY AUTO_INCREMENT,
    clientID VARCHAR(20),
    quoteID INT,
    responseID INT,
    dateRange VARCHAR(30),
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    FOREIGN KEY (clientID) REFERENCES ClientDB(clientID),
    FOREIGN KEY (quoteID) REFERENCES QuoteRequest(quoteID),
    FOREIGN KEY (responseID) REFERENCES QuoteHistory(responseID)
);


-- Optional if only testing Client end: --
CREATE TRIGGER `afterOrderCompleted` AFTER UPDATE ON `WorkOrder`
 FOR EACH ROW BEGIN
    IF NEW.status = 'Completed' THEN
        INSERT INTO Invoice (workOrderID, clientID, amountDue, dateCreated)
        SELECT NEW.workOrderID, NEW.clientID, qh.proposedPrice, NOW()
        FROM QuoteHistory qh
        WHERE qh.responseID = NEW.responseID;
    END IF;
END


CREATE TABLE Invoice (
    invoiceID INT PRIMARY KEY AUTO_INCREMENT,
    workOrderID INT,
    clientID VARCHAR(20),
    amountDue DECIMAL(10, 2),
    dateCreated DATETIME,
    datePaid DATETIME DEFAULT NULL,
    status enum('DUE','OVERDUE','PAID','ADJUSTED') DEFAULT 'DUE',
    discount decimal(10,2) DEFAULT 0.00
    FOREIGN KEY (workOrderID) REFERENCES WorkOrder(workOrderID),
    FOREIGN KEY (clientID) REFERENCES ClientDB(clientID)
);

CREATE TABLE InvoiceResponses (
    responseID INT PRIMARY KEY AUTO_INCREMENT,
    invoiceID INT NOT NULL,
    clientID varchar(20) DEFAULT NULL,
    responseNote VARCHAR(500),
    responseDate DATETIME DEFAULT current_timestamp(),
    FOREIGN KEY (invoiceID) REFERENCES Invoice(invoiceID)
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
1. View Quotes: Access quote details and quote status.
2. Request Modifications: Negotiate on received quotes with counter-offers and different date ranges.
3. Order Tracking: View details of accepted orders and cancel orders.
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
   
## Contributions
Made by Saba and Violet:
Saba primarily worked on David's dashboard queries. Violet primarily worked on the Client's dashboard queries. We both worked together on Zoom for the workload queries.
The diagram was created and discussed together, as well as the structure of the dashboards. We both took our own creative approach on how to display the queries per section, but made suggestions and references from each other and the other's code when we were stuck. Communication was constant and we would communicate before large merges occurred. We also created different text sheets to track changes as well as track them in the github repo. If something like a table structure change had to occur, we communicated why and made note of it. There are a couple minor differences in our code using SQL triggers, but those triggers are optional if you're using the client dashboard. Otherwise, the changes get pushed on David's side as he completes orders, etc. 

