ASSIGNMENT

Create an interactive trading system with two distinct user roles:
1. Clients who place and manage orders through the Client Interface
2. Account Managers who settle trades by matching orders through the Settlement Interface

System Components
● Client Interface (Order Placement)
    ○ Designed for clients to submit and manage their trading orders
    ○ Order Creation Form:
        ■ Asset selector (Load data from publicly available symbols from Binance SPOT exchange)
        ■ Quantity
        ■ Price
        ■ Expiration (two options):
            ■ Time duration: seconds/minutes/hours/days/weeks
            ■ Specific date time picker
    ○ Real-time tables for Active Orders and Order History
    ○ Modification response interface

● Settlement Interface (Account Manager Dashboard)
    ○ Designed for account managers to match and settle trades
    ○ Comprehensive order matching system for trade settlement
    ○ Match opportunities highlighting
    ○ Pre-order actions: Accept, Reject, Modify
    ○ Order history view

Data Simulation Requirements
● Real-time Data Generation
    ○ Simulate trading environment with concurrent orders:
    ○ Approximately half buy-side orders
    ○ Approximately half sell-side orders
    ○ Focus on BTC-USDT trading pair

● Update Frequency
    ○ Data updates every 5 seconds including:
    ○ New orders
    ○ Order fills/cancellations
    ○ Price changes
    ○ Volume changes
    ○ Order expirations

● Use Web socket connection whenever needed
    ○ Handle web socket errors and reconnections gracefully
    ○ You can use libraries like "React useWebSocket"

Sample Data Characteristics
● Order Distribution
    ○ Buy/Sell orders with realistic price distribution
    ○ Appropriate order sizes for BTC-USDT pair

● Market Dynamics
    ○ Basic price movements
    ○ Order matches
    ○ Expiration events

● Time-Based Events
    ○ Order expiration (both duration and datetime-based)
    ○ Modification events
    ○ Trade execution

● Data Quality Requirements
    ○ Realistic price movements
    ○ Plausible order sizes
    ○ Proper decimal handling for crypto assets

Technical Requirements
● Data Management
    ○ Realtime updates through web sockets
    ○ Basic order state management
    ○ Order lifecycle tracking

● Visualization
    ○ Match opportunities highlighting
    ○ Basic volume visualization

● State Management
    ○ Order state tracking
    ○ Settlement recording
    ○ History maintenance

Evaluation Focus
● Data Simulation:
    ○ Data realism
    ○ Realtime updates through web sockets
    ○ State consistency

● Technical Implementation:
    ○ Clean code architecture
    ○ Type safety
    ○ Component organization

● User Experience:
    ○ Interface clarity
    ○ System feedback
    ○ Error handling

Technology Requirements
● Typescript app
● Next JS App router
● Tailwind css
● Zustand for store management if  needed
● Use of Shadcn components and charts
● Recharts or D3 for charting if needed
● Zod for form validation

Submission Requirements
● Video demonstration 
    ○ Screen share of working application
    ○ Audio explanation of:
        ■ Technical architecture
        ■ Key implementation decisions
        ■ Main features demonstration
        ■ Challenge areas and solutions