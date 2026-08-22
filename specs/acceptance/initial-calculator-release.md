# Initial Calculator Release

## Status

Draft

## Scope

This acceptance spec covers the observable user behavior required for the first release of the multipurpose calculator app.

It applies to:

- app-level navigation between calculators
- shared validation behavior
- ASB financing comparison
- compound interest projection
- car loan and early settlement calculation
- property investment versus REIT comparison

## Scenarios

### Scenario: User can discover the available calculators

Given the user opens the app home page
When the page finishes rendering
Then the user sees the initial calculator collection
And the user can navigate to ASB financing, compound interest, car loan, property investment versus REIT, retirement fund, and salary calculator

### Scenario: Header branding copy reflects calculator value rather than implementation internals

Given the user opens any page in the app
When the global Header is visible
Then the site name "Multipurpose Calculators" explains user-facing calculator value and decision support
And the home page hero tagline uses plain-language product copy rather than delivery-slice wording

### Scenario: Home page presents app context and completion state

Given the user opens the app home page
When the page finishes rendering
Then the home page shows an "All Shipped" completion heading above the calculator grid
And a right-column "About this app" card states that results are estimates, that calculations run privately in the browser, and that assumptions are documented per calculator
And a feedback CTA is present and clearly indicates that it is not yet active

### Scenario: Home-page CTA emphasis follows documented priority rules

Given the user opens the app home page
When multiple live calculators are available
Then CTA emphasis matches the documented priority rule from the UI spec
And users can clearly identify available calculator routes from the CTA group

### Scenario: Display-font headings render consistently across the Header and all implemented routes

Given the user opens the home page, compound-interest page, and car-loan page
When route-level headings and the Header site name are rendered on supported breakpoints
Then heading text remains legible without clipped or malformed glyph combinations such as `f/fi`
And heading rhythm remains readable without requiring zoom to interpret core page intent

### Scenario: User sees consistent empty-state guidance before calculation

Given the user opens any calculator page
When required inputs have not yet been provided
Then the result area stays empty
And the page explains what inputs are still required before calculation can run

### Scenario: User receives field-level validation feedback

Given the user opens a calculator page
When the user enters missing, negative, out-of-range, or otherwise invalid values defined by that feature spec
Then the page blocks calculation
And the invalid fields show validation guidance near the relevant input
And stale results for the invalid input set are not shown as current output

### Scenario: User can compare ASB strategies on one page

Given the user opens the ASB financing calculator
And the user enters valid financing, dividend, and horizon inputs
When the user runs the calculation
Then the page shows the compounding strategy, dividend-offset strategy, and direct ASB strategy together
And the page shows yearly progression and final comparison metrics for all three strategies
And the page states the documented financing and dividend assumptions in plain language

### Scenario: User can project compound growth with or without contributions

Given the user opens the compound interest calculator
And the user enters a valid principal, annual rate, duration, and compounding frequency
When the user runs the calculation
Then the page shows final projected balance, total contributions, and total growth
And if recurring contributions were entered, the result includes their effect using the documented end-of-period assumption

### Scenario: Compound-interest projection periods are user-readable

Given the user opens the compound-interest calculator
And the user runs a valid calculation
When the projection table is visible
Then the period column uses understandable labels for the selected compounding mode
And the period column does not expose raw floating-point year ratios as the primary user-facing label

### Scenario: Compound-interest form spacing remains balanced against results panel

Given the user opens the compound-interest calculator on desktop and mobile breakpoints
When the form and result sections are rendered
Then field and section spacing supports readable flow without disproportionate blank zones
And both columns or stacked sections remain visually balanced and scannable

### Scenario: User can estimate car-loan early settlement using the documented model

Given the user opens the car loan calculator
And the user enters valid vehicle price or financed principal, flat interest rate, tenure, and early-settlement month
When the user runs the calculation
Then the page shows scheduled monthly instalment, total repayable amount, and early-settlement results
And the early-settlement result includes earned interest, unearned-interest rebate, and projected settlement amount
And the page states that the settlement result uses the documented Rule of 78 style model for the fixed-rate case

### Scenario: Car-loan metric values stay contained and readable

Given the user opens the car-loan calculator
And the user runs a valid calculation that produces currency figures across all summary cards
When the user views results on supported desktop and mobile breakpoints
Then metric values remain visually contained within their cards
And labels and figures remain readable without clipping or overflow beyond card boundaries

### Scenario: Car-loan heading and assumptions text remain legible across breakpoints

Given the user opens the car-loan calculator
When the page is viewed across supported breakpoints
Then heading and assumptions text render without clipped glyphs or broken line rhythm
And the content remains understandable without requiring zoom to interpret the primary message

### Scenario: User can compare property investment against two REIT strategies

Given the user opens the property investment versus REIT calculator
And the user enters valid financing, rent, expense, holding-period, and exit inputs
And REIT initial capital is left at zero
When the user runs the calculation
Then the page shows the property strategy and both REIT strategies over the same holding period
And the property result includes loan balance, cash flow, exit proceeds, and user cash outflow
And each REIT strategy's monthly contribution is derived from the property strategy's scheduled monthly instalment, with the second REIT strategy also including the property's monthly-equivalent recurring costs
And the result identifies the leading strategy among the property path and both REIT paths

### Scenario: User can project salary growth with increments

Given the user opens the salary calculator
And the user enters a valid gross monthly salary, worker category, and age
And the user selects a percentage increment mode and enters an annual increment rate
And the user adds a one-off increment anchored to a future career year
When the user runs the calculation
Then the page shows a yearly projection table with one row per projected year
And the page shows final-year gross monthly salary, final-year net monthly salary, cumulative net salary, and cumulative employer cost summary metrics
And the yearly projection table is collapsed by default and can be expanded via a keyboard- and tap-reachable disclosure control

### Scenario: User can navigate between calculators without losing app-shell context

Given the user is on any calculator page
When the user navigates to another calculator using the app navigation
Then the app shell remains consistent
And the destination calculator page loads with its own feature-specific form and result structure

### Scenario: User can open the mobile menu on a small screen and navigate to any calculator

Given the user opens any page on a small-screen viewport below the `md` breakpoint
When the user activates the hamburger disclosure in the Header
Then the menu lists Overview and all six calculators
And the user can navigate to any calculator without losing app-shell context
And pressing ESC closes the menu and returns focus to the toggle

## Related Specs

- UI: [specs/ui/initial-calculator-app.md](../ui/initial-calculator-app.md)
- Features:
  - [specs/features/asb-financing.md](../features/asb-financing.md)
  - [specs/features/compound-interest.md](../features/compound-interest.md)
  - [specs/features/car-loan.md](../features/car-loan.md)
  - [specs/features/home-and-car-loan-ui-refinement.md](../features/home-and-car-loan-ui-refinement.md)
  - [specs/features/ui-readability-and-layout-consistency.md](../features/ui-readability-and-layout-consistency.md)
  - [specs/features/property-investment.md](../features/property-investment.md)
  - [specs/features/salary-calculator.md](../features/salary-calculator.md)
