# HappyHourNow — App Flow Diagram (Frontend)

```text
                    ┌───────────────────────┐
                    │        App.js         │
                    │  (Root Navigation)    │
                    └──────────┬────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐
│   Map Screen      │  │   List Screen    │  │   Chat Placeholder     │
│  (HappyHourNow)   │  │   (SearchList)   │  │   (Ask HappyHour AI)   │
└──────────────────┘  └──────────────────┘  └────────────────────────┘
          │                    │                    │
          │                    │                    │
          ▼                    ▼                    ▼
     Shows static         Shows list of        Empty placeholder
     map with pins        deals (cards)        with title text
          │                    │                    │
          └────────────────────┴────────────────────┘
                        ▲
                        │
           Bottom Tab Navigation (Map | List | Chat)
```
