SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
Project Title

PESO Lambunao – NSRP Jobseeker Registration & Management System

Client

Public Employment Service Office (PESO) – Lambunao

Program

Department of Labor and Employment (DOLE)
National Skills Registration Program (NSRP)

1. INTRODUCTION
1.1 Purpose

This document defines the functional and non-functional requirements for a web-based system that digitizes the DOLE NSRP Jobseeker Registration Form, enabling PESO Lambunao staff to encode, manage, search, filter, and export jobseeker data efficiently.

1.2 Scope

The system will:

Digitally encode all data from the official NSRP Jobseeker Registration Form

Store jobseeker records in a structured database

Provide a dashboard with search and advanced filtering

Allow export of records to CSV

Support multiple PESO users with role-based access

Serve as a foundation for future email and SMS blasting features

The system does not include:

Public/self-service jobseeker registration (Phase 1)

Employer/job posting modules

SMS or email blasting in the initial release

1.3 Definitions, Acronyms, and Abbreviations
Term	Definition
PESO	Public Employment Service Office
DOLE	Department of Labor and Employment
NSRP	National Skills Registration Program
Jobseeker	Individual registered under NSRP
Encoder	PESO staff who inputs data
Admin	PESO staff with elevated privileges
2. OVERALL DESCRIPTION
2.1 Product Perspective

The system replaces a paper-based process with a centralized digital repository. It will be a web-based internal system accessed only by PESO staff.

2.2 User Classes and Characteristics
User Role	Description
Admin	Manages users, full access to records and exports
Encoder	Encodes and edits jobseeker data
Viewer (optional)	Read-only access

Users are assumed to have basic computer literacy.

2.3 Operating Environment

Web browser (Chrome, Edge, Firefox)

Desktop or laptop

Internet or local network deployment

2.4 Assumptions and Constraints

All data fields must match the official NSRP form

Data privacy laws (Philippine Data Privacy Act) must be respected

System must support thousands of records

Encoding speed and accuracy are critical

3. SYSTEM FEATURES & FUNCTIONAL REQUIREMENTS
3.1 User Management Module
3.1.1 Description

Provides access control for PESO staff.

Functional Requirements

FR-UM-01: The system shall allow Admin users to create PESO user accounts.

FR-UM-02: The system shall allow users to log in using username and password.

FR-UM-03: The system shall enforce role-based access control.

FR-UM-04: The system shall allow password reset by Admin.

3.2 Jobseeker Registration Module (Core Module)
3.2.1 Description

Allows PESO staff to encode all fields from the NSRP Jobseeker Registration Form.

3.2.2 Functional Requirements – Detailed Field-Level Accuracy
I. PERSONAL INFORMATION
Name Information

Surname

First Name

Middle Name

Suffix (Sr., Jr., III, etc.)

Birth & Demographics

Date of Birth (mm/dd/yyyy)

Sex (Male, Female)

Religion

Civil Status (Single, Married, Widowed)

Present Address

House No. / Street / Village

Barangay

Municipality / City

Province

Identification

TIN

Disability (Multiple selection)

Visual

Hearing

Speech

Physical

Mental

Others (Specify)

Physical & Contact Details

Height (feet)

Contact Number/s

Email Address

II. EMPLOYMENT STATUS / TYPE
Employment Status

Employed

Unemployed

If Employed

Wage Employed

Self-employed (Specify):

Fisherman / Fisherfolk

Vendor / Retailer

Home-based Worker

Transport

Domestic Worker

Freelancer

Artisan / Craft Worker

Others (Specify)

If Unemployed

New Entrant / Fresh Graduate

Finished Contract

Resigned

Retired

Terminated / Laid off (Local)

Terminated / Laid off (Abroad) – Specify Country

Terminated / Laid off due to Calamity

Others (Specify)

Duration of job search (months)

Overseas Employment

OFW (Yes / No)

Country (if OFW)

Former OFW (Yes / No)

Latest country of deployment

Month and year of return to Philippines

4Ps Program

4Ps Beneficiary (Yes / No)

Household ID Number

III. JOB PREFERENCE
Preferred Occupation

Employment Type (Part-time / Full-time)

Preferred Occupation #1

Preferred Occupation #2

Preferred Occupation #3

Preferred Work Location

Local (City / Municipality)

Entry #1

Entry #2

Entry #3

Overseas (Country)

Entry #1

Entry #2

Entry #3

IV. LANGUAGE / DIALECT PROFICIENCY

For each language:

English

Filipino

Mandarin

Others (Specify)

Each has:

Read

Write

Speak

Understand

V. EDUCATIONAL BACKGROUND
Currently in School

Yes / No

Education Levels (each with fields below)

Elementary

Secondary (Non-K12)

Secondary (K-12)

Senior High (Strand)

Tertiary

Graduate Studies

Post-Graduate Studies

For each level:

Course / Strand

Year Graduated

Level Reached (if undergraduate)

Year Last Attended

VI. TECHNICAL / VOCATIONAL & OTHER TRAINING

Up to 3 entries:

Training / Vocational Course

Hours of Training

Training Institution

Skills Acquired

Certificates Received (NC I, NC II, NC III, etc.)

VII. ELIGIBILITY / PROFESSIONAL LICENSE
Eligibility (Civil Service)

Eligibility Name

Date Taken
(up to 2 entries)

Professional License (PRC)

License Name

Valid Until
(up to 2 entries)

VIII. WORK EXPERIENCE (Last 10 Years)

For each entry:

Company Name

Address (City / Municipality)

Position

Number of Months

Employment Status:

Permanent

Contractual

Part-time

Probationary

IX. OTHER SKILLS (WITHOUT CERTIFICATE)

Checkboxes:

Auto Mechanic

Beautician

Carpentry Work

Computer Literate

Domestic Chores

Driver

Electrician

Embroidery

Gardening

Masonry

Painter / Artist

Painting Jobs

Photography

Plumbing

Sewing Dresses

Stenography

Tailoring

Others (Specify)

X. CERTIFICATION / AUTHORIZATION

Certification acknowledgement (static text)

Signature of Applicant

Date Signed

XI. FOR USE OF PESO ONLY
Referral Programs

SPES

GIP

TUPAD

JobStart

DILEEP

TESDA Training

Others (Specify)

Assessment

Assessed By (Printed Name)

Signature

Date

3.3 Dashboard & Records Management
Functional Requirements

View all jobseekers in tabular form

Search by name or keyword

Filter by:

Age

Sex

Address

Employment status

Skills

Education

Job preference

OFW / 4Ps status

View full jobseeker profile

Edit existing records

3.4 Export Module
Functional Requirements

Export all records to CSV

Export filtered results to CSV

Preserve column consistency for DOLE reporting

4. NON-FUNCTIONAL REQUIREMENTS
4.1 Performance

Search results returned within 2 seconds for 10,000+ records

4.2 Security

Role-based access

Password hashing

Audit logging (recommended)

4.3 Data Privacy

Compliance with Philippine Data Privacy Act

Restricted access to personal data

4.4 Usability

Encoder-friendly form layout

Keyboard navigation support

Minimal scrolling where possible

5. FUTURE ENHANCEMENTS (OUT OF SCOPE)

Email blasting

SMS blasting

Job matching

Employer access

Online jobseeker self-registration