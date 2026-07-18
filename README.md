# IT Elective 4 - Project Base Setup (GT1 Part 2)

## Project Concept Description
This project acts as the foundational TypeScript backend typing ecosystem for an academic management software application. It handles user state identities, courses, and project submissions securely.

## Defined Project Interfaces & Types
- **User / Course / Submission**: Fundamental database model definitions.
- **ApiResponse<T>**: Generic server response data structure.
- **UserUpdate / UserPreview**: Utility interfaces generated for profile edits.
- **SubmissionStatus**: Enum capturing individual homework lifecycles.

## Installation & Setup Instructions
To initialize and check this application workspace locally, run:

```bash
# Verify type matching
npx tsc --noEmit

# Test code logs
npx ts-node src/index.ts