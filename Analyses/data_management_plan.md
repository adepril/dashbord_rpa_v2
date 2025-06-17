# Data Management Plan

This document outlines the end-to-end data management process in the project, from retrieval in Firebase to display, including filtering, processing, calculations for histograms, and relationships between data entities.

## 1. Introduction to Data Flow
This section provides an overview of how data is managed in the project. Data starts with retrieval from Firebase Firestore, undergoes filtering and processing, and ends with display in the UI. Key files involved are:
- `lib/firebase.ts`: Initializes Firebase and provides access to Firestore.
- `utils/dataFetcher.ts`: Handles data fetching, filtering, and initial processing.
- `components/Chart.tsx`: Processes data further for visualizations like histograms.

## 2. Data Retrieval from Firebase
Data retrieval begins in `lib/firebase.ts`, where the Firebase app is initialized using the configuration:
- The file imports necessary Firebase modules and sets up Firestore (`db`) and authentication (`auth`).
- In `utils/dataFetcher.ts`, functions like `fetchAgenciesByIds`, `fetchAllEvolutions`, and `fetchEvolutionsByProgram` use Firestore queries to retrieve data from collections such as 'agences', 'evolutions', and 'utilisateurs'.
- Queries are constructed using `query` and `where` clauses to filter data based on criteria (e.g., `where('idAgence', '==', agencyId)`).

## 3. Data Filtering and Processing
Once data is retrieved, it is filtered and processed in `utils/dataFetcher.ts`:
- **Filtering**: For example, in `fetchAllEvolutions`, documents are grouped by the 'Robot' field, and only the document with the highest 'statut' value is retained. This ensures only the most relevant data is used.
- **Processing**: Data is mapped to specific interfaces (e.g., transforming raw Firestore data into arrays of objects). Error handling catches issues and returns empty arrays to prevent failures. Additionally, functions like `formatNumber` format numerical data for consistency.
- This step prepares data for display by removing invalid entries and applying conditional logic, ensuring only processed, clean data is passed to UI components.

## 4. Calculations for Histogram Display
In `components/Chart.tsx`, retrieved data is further processed for histogram rendering:
- The component generates chart data for the current month (up to 31 days) by creating an array of objects.
- Calculations include multiplying execution counts by time per unit (as referenced in `utils/dataFetcher.ts` comments) and formatting values using `formatDuration` from `lib/utils`.
- For different robot types (e.g., 'temps'), specific logic applies, such as converting values to durations or counts, and handling edge cases where values are zero or undefined.

## 5. Relationships Between Data Entities
The project involves multiple Firestore collections with interrelations:
- 'Agences' collection links to 'evolutions' via agency IDs, allowing data to be filtered by agency.
- 'Evolutions' data may reference user information from 'utilisateurs' through fields like userAgenceIds.
- These relationships are queried and combined in `utils/dataFetcher.ts` to build comprehensive data sets, ensuring that related data (e.g., agency details with evolution stats) is fetched and processed together.

## 6. Final Display
Processed data is rendered in `components/Chart.tsx`:
- The component uses Recharts to display histograms, tooltips, and indicators.
- Data is conditionally rendered based on availability, with formatting for labels and axes to ensure user-friendly display.
- This final step integrates all filtered and calculated data into the UI, providing visualizations like bar charts for histograms.

## Mermaid Diagram
To visualize the data flow:

```mermaid
graph TD
    A[Firebase Firestore Collections] --> B[utils/dataFetcher.ts]
    B --> C[Filtering & Processing Logic]
    C --> D[components/Chart.tsx]
    D --> E[UI Components for Display]
    A -->|Query with Filters| B
    B -->|Processed Data Arrays| C
    C -->|Calculated Chart Data| D
    D -->|Rendered Charts & Indicators| E