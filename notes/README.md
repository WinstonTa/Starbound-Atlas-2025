# Happy Mapper

## Overview

Happy Mapper is a mobile application that helps users discover nearby happy hour deals and restaurant specials in real time.  
For the minimum viable product (MVP), the app will focus on showing which nearby bars and restaurants have a deal on the current day.  
The interface consists of two primary screens accessible through a bottom navigation bar: Map and List.

---

## MVP Description
### Screen 1: Map View (Left Tab)
Displays an interactive map centered on the user’s current GPS location.  
Nearby bars and restaurants that have happy hour deals on the current day appear as pins on the map.  
When tapped, a pin opens a small card containing:
- Venue name  
- Distance from the user  
- Deal time window (e.g., “3–6 PM”)  
- Short description of the deal (e.g., “$5 Drafts, $2 Oysters”)  

The bottom navigation bar includes two icons: Map and List.

---

### Screen 2: List View (Right Tab)
Displays a scrollable list of bars and restaurants that have deals on the current day.  
Each entry contains:
- Venue name and distance  
- Deal time window  
- Short description of the offer  

Tapping a list item opens more details about the venue and its deals.  
Sorting and filtering are not included in the MVP to keep functionality simple.  
The bottom navigation bar remains consistent across screens.

---

## MVP Data Requirements

### Venue (required)
- venue_id  
- venue_name  
- latitude  
- longitude  
- address  
- hours_of_operation (by day)

### Deal (required)
- deal_id  
- venue_id  
- deal_description (short string)  
- days_active (e.g., Mon–Fri)  
- start_time  
- end_time

### Runtime (not stored)
- user_lat  
- user_long  
- distance (computed from user + venue)

Note:  
“Runtime (not stored)” means this data is generated or used temporarily while the app is running but is not saved to the backend or database.  
For example, user_lat and user_long come from the phone’s GPS in real time, and distance is calculated on the fly based on the user’s current position.  
These values reset each time the app is reopened or the user moves.

---

## Future Planned Features
The app focuses on immediacy and convenience, showing deals happening right now at local bars and restaurants.  

Future updates are expected to include:
- A filter and sorting system that lets users organize deals by time, price, or cuisine.  
- A feature that allows users to upload their own pictures of happy hour menus, with automatic text extraction to populate deal data. This extracted information will then be parsed, transformed, and loaded by the AI/backend teams to update and expand the deal database.  
- An AI-powered chat interface that enables users to ask natural-language questions such as:  
  “Where can I get $5 margaritas near me?”  
  “Any rooftop bars with happy hour today?”  

For the minimum viable product, these features are not included.  
We will instead rely on internally obtained happy hour information for initial testing and deployment.
