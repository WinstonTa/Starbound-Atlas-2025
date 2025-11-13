# HappyHourNow (Frontend MVP Specification — React Native + Expo)

## Overview

**HappyHourNow** is a mobile application that helps users discover nearby happy hour deals and restaurant specials in real time.  
This document describes the **frontend-only scope** of the minimum viable product (MVP), to be implemented using **React Native with Expo**.  

The MVP focuses exclusively on:
- App layout and navigation structure.  
- Visual design and user interface components.  
- Static example data for UI demonstration.  

**Backend, data fetching, and live deal updates are not part of this stage.**

The interface consists of two primary screens accessible through a bottom navigation bar: **Map** and **List**.  
A third **Chat** tab exists only as a visual placeholder for future use.

---

## MVP Description

### Screen 1: Map View (Left Tab)

Displays a simple map centered on the user’s general location (can use a static default region for the prototype).  
Nearby bars and restaurants that have deals appear as red pins on the map.

When a pin is tapped, it may visually highlight (e.g., change color or outline).  
No popup or detail card is shown in the MVP — that interaction will be added later.

The bottom navigation bar includes three tabs: **Map**, **List**, and **Chat**.

---

### Screen 2: List View (Right Tab)

Displays a scrollable list of bars and restaurants with example deal data.  
Each entry includes:
- Venue name and distance  
- Deal time window  
- Short description of the offer  
- A “Get Directions” button (non-functional in the MVP)

Tapping a list item does not trigger navigation or data loading in this version.  
The focus is on UI layout, styling, and component structure.

---

## MVP Data Requirements (Frontend Representation Only)

Use **hardcoded static data** for display.  
No backend integration, state management, or API calls are required.

**Example data structure for reference:**
```js
const sampleDeals = [
  {
    id: 1,
    venue_name: "Taqueria del Sol",
    distance: "2.2 mi",
    hours: "2:30–5:30 PM",
    deal: "$5 margaritas, $10 taco trio"
  },
  {
    id: 2,
    venue_name: "Harbor Tap & Grill",
    distance: "1.5 mi",
    hours: "3:00–6:00 PM",
    deal: "$6 wine, half-off appetizers"
  }
];
```

---

## React Native + Expo Setup

### Environment

Develop the frontend using **React Native with Expo**, which provides a preconfigured environment for rapid development and live preview on mobile devices.

### Setup Steps

1. **Create the project:**
   ```bash
   npx create-expo-app HappyHourNow
   cd HappyHourNow
   ```

2. **Start the development server:**
   ```bash
   npx expo start
   ```
   - Scan the QR code with the **Expo Go** app on your phone.  
   - The app reloads automatically as you make changes.

3. **Recommended folder structure:**
   ```
   HappyHourNow/
   ├── App.js
   ├── screens/
   │   ├── MapScreen.js
   │   ├── ListScreen.js
   │   └── ChatPlaceholder.js
   ├── components/
   │   ├── BottomNavBar.js
   │   └── ListCard.js
   ├── assets/
   │   └── icons/
   ├── package.json
   ```

4. **Suggested libraries for UI:**
   ```bash
   npm install react-native-maps @react-navigation/native @react-navigation/bottom-tabs
   npm install expo-location
   ```

---

## UI Specification

### General Layout
- **Top navigation bar:** centered bold title in black.  
- **Bottom navigation bar:** white background with slight top shadow.  
  - Tabs: **Map**, **List**, **Chat**.  
  - Active tab icon: black and filled.  
  - Inactive tabs: gray and outlined.  
- Font: Inter, SF Pro, or Roboto.  
- Minimalistic and clean design emphasizing readability.

---

### Screen 1 — Map View

**Title:** HappyHourNow  
**Top-right icon:** search icon (magnifying glass).  

**Main area:**
- Light gray map background (using `react-native-maps`).  
- Several static red map pins positioned using latitude/longitude coordinates.  
- Pins are purely visual and do not trigger a popup in this version.  
- When tapped, a pin may visually highlight.  

**Bottom navigation bar:** active tab = Map.

---

### Screen 2 — List View

**Title:** SearchList  
**Top-right icon:** hamburger menu (three horizontal lines).  

**Below title:**  
- Rounded rectangular search bar with light gray background.  
- Left: magnifying glass icon.  
- Placeholder text: “Search deals or places…”

**Main section (scrollable list):**  
Each card should have:
- White background  
- Rounded corners  
- Light drop shadow  
- Vertical padding  

**Example cards:**
- **Taqueria del Sol:** 2.2 mi — “2:30–5:30 PM, $5 margaritas, $10 taco trio”  
- **Harbor Tap & Grill:** 1.5 mi — “3:00–6:00 PM, $6 wine, half-off appetizers”  
- **The Rusty Anchor Bar:** 3.4 mi — “4:00–7:00 PM, $4 draft beers, $8 sliders”  
- **Sunset Rooftop Lounge:** 5.1 mi — “5:00–8:00 PM, 2-for-1 cocktails”  
- **Marina Cantina:** 6.8 mi — “2:00–5:00 PM, $6 mojitos, $3 chips & salsa”

**Bottom navigation bar:** active tab = List.

---

### Colors and Style
- Primary text: #000000  
- Secondary text: #777777  
- Map pin color: #E74C3C (red)  
- Button background: #EDEDED  
- Button text: #000000  
- Background: #F9F9F9  
- Active tab icon: black  
- Inactive tab icons: gray (#A0A0A0)

---

## Notes for Developers
- **Frontend only:** no backend or data persistence in this version.  
- Focus on layout, navigation, and consistent styling.  
- The **bottom overlay card** (map pin details) will be added in a later version.  
- The **Chat tab** should display only the title “Ask HappyHour AI.”  
- All “Get Directions” buttons are non-functional placeholders.  
- Primary goal: produce a polished and consistent user interface using static data.
