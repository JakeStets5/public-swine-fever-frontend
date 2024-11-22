# African Swine Fever Test Submission Website (Frontend)

This repository contains the frontend code for the African Swine Fever test submission website. The purpose of this web app is to allow users to submit swine fever test results, which are processed by a machine learning model to determine whether the test is positive or negative. Positive results are marked on a map by city location. This repository is mainly for informative purposes, as the API calls are made to Azure services that require an account and subscription.

## Features
- Select a city where the test is conducted.
- Upload an image of the test from your computer.
- Submit the test for analysis via a machine learning model.
- Display positive test results as markers on a map.
- User authentication required for test submission.

## Prerequisites
- **Mapbox API Key:** You will need a Mapbox account and an API key to use the mapping features.
- **Google Places API Key:** You will need a google account and an API key to use the geolocation features.
- **Azure Account and Subscription:** You will need an Azure account and an API key to use the database, web app, and machine learning features.
- **Environment Variables:** You will need to set up a `.env` file in the root directory of the project with the following variable:
  
  `MAPBOX_API_KEY=your_mapbox_api_key`

- **Node.js and npm:** Ensure you have Node.js installed. If not, [download and install it](https://nodejs.org/).

## Installation
To install the necessary dependencies, run the following command in the project root:

`npm install`

## Usage
**Note:** This repository is for reference only. 

### Steps to Submit a Test:
1. **Sign In:** Users must sign in before they can submit a test. A login page is provided to authenticate users.
2. **Select a City:** Use the dropdown menu to select the city from which the test is being submitted.
3. **Upload an Image:** Click the "Choose File" button to select an image of the swine fever test from your computer.
4. **Submit the Test:** Click the "Submit" button. The uploaded image will be sent to a machine learning model for analysis. If the test is positive, a marker will be added to the map at the location of the selected city.

### Map Features:
- **Positive Results:** Only positive test results are shown on the map as markers. Negative results are stored in the database but do not appear on the map.
- **Map Integration:** The map is rendered using Mapbox, with Leaflet.js generating the markers for positive test cases.

## API Calls and Azure Services
The web app interacts with various Azure services to submit test results and query the machine learning model. API calls require an active Azure subscription and appropriate access credentials, which are not included in this repository.

## Contribution
Contributions are not encouraged in this repository due to the use of proprietary Azure services that require a subscription. If you'd like to experiment with the code or make changes, please clone the local version of the repository [here](https://github.com/JakeStets5/swine-fever-website-local).
