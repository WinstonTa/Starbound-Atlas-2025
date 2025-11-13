# HappyHourNow — Frontend Coding Checklist (React Native + Expo)

This checklist outlines the coding order and implementation milestones for building the HappyHourNow MVP using React Native and Expo.  
The focus is purely on the frontend: UI, layout, navigation, and component structure.

---

## 1. Project Setup
- [ ] Install **Node.js** and **npm** if not already installed.  
- [ ] Run `npx create-expo-app HappyHourNow`.  
- [ ] Navigate into the project folder and run `npx expo start` to verify the app runs.  
- [ ] Initialize a Git repository and create your first commit.  
- [ ] Confirm you can preview on your device using the Expo Go app.

---

## 2. Project Structure
- [ ] Create the following directories:
  ```
  /screens
  /components
  /assets/icons
  ```
- [ ] Create empty files:
  - `screens/MapScreen.js`
  - `screens/ListScreen.js`
  - `screens/ChatPlaceholder.js`
  - `components/BottomNavBar.js`
  - `components/ListCard.js`

---

## 3. Navigation Setup
- [ ] Install React Navigation dependencies:
  ```bash
  npm install @react-navigation/native @react-navigation/bottom-tabs
  npm install react-native-screens react-native-safe-area-context
  ```
- [ ] Wrap the app in a navigation container in `App.js`.  
- [ ] Implement a bottom tab navigator with three tabs:
  - **Map** → `MapScreen`
  - **List** → `ListScreen`
  - **Chat** → `ChatPlaceholder`
- [ ] Set up icons for each tab (active/inactive states).

---

## 4. Map Screen
- [ ] Install `react-native-maps`:
  ```bash
  npm install react-native-maps
  ```
- [ ] Add a static map centered on a default region.  
- [ ] Display several static red pins (`Marker` components) using example coordinates.  
- [ ] Implement tap feedback (e.g., pin color change on press).  
- [ ] Add a simple header (`HappyHourNow`) and a top-right search icon.

---

## 5. List Screen
- [ ] Create a scrollable view containing multiple `ListCard` components.  
- [ ] Each `ListCard` displays:
  - Venue name (bold)  
  - Distance (right-aligned gray text)  
  - Deal time window and short description  
  - “Get Directions” button (non-functional)  
- [ ] Add a top header titled `SearchList` and a search bar placeholder.  
- [ ] Ensure consistent spacing and visual alignment with the map screen.

---

## 6. Chat Placeholder Screen
- [ ] Create a simple screen with the title “Ask HappyHour AI.”  
- [ ] Leave the body blank for future implementation.  
- [ ] Include it in the bottom tab navigation.

---

## 7. Component Styling
- [ ] Use consistent color palette:
  - Primary text: `#000000`
  - Secondary text: `#777777`
  - Map pins: `#E74C3C`
  - Buttons: `#EDEDED`
  - Background: `#F9F9F9`
- [ ] Use rounded corners, shadows, and padding for all cards.  
- [ ] Use a clean font (Inter, SF Pro, or Roboto).  
- [ ] Verify active/inactive tab icons render correctly.

---

## 8. Testing and Polish
- [ ] Run `npx expo start` and test navigation between screens.  
- [ ] Ensure scroll performance is smooth on List view.  
- [ ] Check that map renders correctly and pins appear at expected positions.  
- [ ] Verify consistent margins and typography.  
- [ ] Clean up unused imports and console logs.  
- [ ] Commit and push final code.

---

## 9. Optional Enhancements (Post-MVP)
- [ ] Add dynamic map popups when a pin is tapped.  
- [ ] Add modal for venue details.  
- [ ] Replace static data with API-driven content.  
- [ ] Integrate `expo-location` for GPS-based positioning.  
- [ ] Begin implementing the Chat AI interface.
