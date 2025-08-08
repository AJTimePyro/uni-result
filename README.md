# GGSIPU University Result Ranklist

This project is a comprehensive system for fetching, parsing, and displaying the results of students from Guru Gobind Singh Indraprastha University (GGSIPU) to generate detailed rank lists. The goal was to create a unified platform for all courses offered by GGSIPU, unlike other existing websites that are limited to a few select programs.

## Key Features

-   **Comprehensive Course Coverage**: Aims to generate rank lists for **every course** offered by GGSIPU, providing a single, unified platform for all students.
-   **Cost-Effective Hybrid Storage**: Utilizes a clever hybrid storage model to minimize costs.
    -   **MongoDB**: Stores lightweight metadata (university, degrees, colleges, subjects).
    -   **Google Drive**: Stores the actual student result data in CSV files, leveraging Google Drive's free storage to avoid expensive database costs for large datasets.
-   **Automated Data Pipeline**: The entire process, from fetching PDFs to parsing data and storing it, is fully automated.

## Project Mechanism

The project is divided into two main components: a Python-based backend for data processing and a Next.js frontend for user interaction and data visualization.

### 1. Data Ingestion & Processing (Backend)

The core of the project lies in its powerful PDF parsing pipeline, which automates the extraction of result data from official university PDFs.

-   **PDF Parsing**: The system uses a Python script (`parse.py`) that can take either local PDF files or a list of PDF URLs. It leverages the `pdfplumber` library to extract text and table data from these documents.
-   **Intelligent Data Extraction**: A custom parser (`IPU_Result_Parser`) intelligently scans the PDF pages. It distinguishes between pages containing the "Scheme of Examinations" (subject lists) and pages containing student results.
-   **Structured Data Creation**: Using regular expressions, the parser extracts key metadata such as college, degree, and semester. It then meticulously pulls detailed information for each student, including their roll number, name, and subject-wise marks and grades.
-   **Hybrid Storage**: The processed data is stored using a hybrid model: metadata is saved in MongoDB for fast querying, while the large result datasets are stored as CSVs in Google Drive to keep operational costs low. This creates a robust and queryable system for academic performance.

### 2. Frontend & API (Next.js)

The frontend is a modern web application built with Next.js and React, providing a dynamic and user-friendly interface.

-   **API Layer**: The Next.js backend serves a REST API endpoint (`/api/result`) that communicates with the MongoDB database. This endpoint allows for filtering results based on criteria like college, degree, and semester.
-   **User Interface**: The main interface, located at the `/ranklist` route, allows users to:
    -   Filter and search for specific rank lists.
    -   View the top-performing students at a glance.
    -   Browse a complete, sortable rank list table.
    -   Click on any student to view a detailed card with their marks in all subjects for that semester.
-   **Modern Tech Stack**: The UI is built with modern tools including:
    -   **React & Next.js**: For a fast and server-rendered application.
    -   **Tailwind CSS**: For utility-first styling.
    -   **TanStack Query**: For efficient data fetching, caching, and state management.
    -   **Framer Motion & Three.js**: For a rich, animated, and interactive "cosmic" theme.

## Note

Due to various reasons, I have decided to discontinue the development of this project. The code is left as-is and the project is incomplete. It stands as a proof-of-concept for a scalable result-ranking system.

## Credits

A special thanks to the following individuals for their contributions and support:

-   [Abhishek](https://github.com/10-abhi)
-   [Alok Jha](https://github.com/Alokjha2004)
