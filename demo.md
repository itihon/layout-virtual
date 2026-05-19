# General description

A web-site showcasing my framework agnostic virtualized layout library. The library currently supports vanilla js, React, Vue, Angular. It provides a fully dynamic layout, supports responsive grid layout without the user of the library concerning about item heights and measurements. The items are rendered "as is" and are added as if in a regular non-virtualized container allowing the user to add desired styling.

- layout-virtual (the core)
- react-layout-virtual (virtualization component for React)
- vue-layout-virtual (virtualization component for Vue)
- angular-layout-virtual (virtualization component for Angular)

## Possible use cases (with code examples for each framework)

Each use case should demonstrate the following capabilities: 

- Resize

- Insertion/deletion at an arbitrary index

- Items height change (FixedListLayout)

- window scroller

### FixedListLayout

- Fixed list of items (with/without margins)

- Code rendering

- Contact list with sticky items

### DynamicListLayout

- List of articles with unknown item height

- Table with rows of unknown height

- Chat messages

- Infinite scroll

- Scroll at an arbitrary position of a lazy loaded items list with loading only visible items. 

## Pages

- About (the main page)
- Examples (contains examples, each have the version for each framework)
- API (contains API description for each framework)

## Routes

 - "/"
 - "/examples/[FRAMEWORK_NAME]/[EXAMPLE_NAME]"
 - "/API/[FRAMEWORK_NAME]"

 Where "FRAMEWORK_NAME" is either: 
 - JS-TS (default)
 - React
 - Vue
 - Angular

 "EXAMPLE_NAME" is the name of a particular example. Each example has a version for each framework. So the routes number in the "examples" subdirectory equals "FRAMEWORK_NAME" count * "EXAMPLE_NAME" count. The routes number in the "API" subdirectory equals "FRAMEWORK_NAME" count.

## Content

Each page has a header and footer, and shared Frameworks selector component which on the About page is a tab component that shows installation variant for a selected framework (sets "FRAMEWORK_NAME" in the route), on the Examples page allows the user to select a framework to show an example for (sets "FRAMEWORK_NAME" in the route), on the API page allows the user to select a framework for which to show API documentation (sets "FRAMEWORK_NAME" in the route as well). Once "FRAMEWORK_NAME" is set, it is shared across pages.

### Header

Sticks to the top and contains:
  - Library name and the current version (evaluated at build time)
  - Navbar
  - Github Link

Responsiveness: When screen width is not enough, Navbar wraps to the second line, Lirary name and Github link stay on the first line.

#### Navbar

Contains page links:
  - About
  - Examples
  - API

Active link should be indicated.

The "Examples" link is a drop down list with links leading to the route "/examples/[FRAMEWORK_NAME]/[EXAMPLE_NAME]". The current chosen option in the drop down list should be indicated.

### Footer

Contains:
  - Library name
  - Author name
  - Credits

### About page

Contains:
  - Hero section with a heading and the library description. Possible slogan: "Virtualization has never been easier.". (It alignes with my other library slogan "Validation has never been easier.")
  - Installation info with the heading and a tab component with npm install command specific to the selected framework.
  - [Optionally, not decided yet] virtualized resizeable auto grid example without code, that resizes from one column to multiple, for the user just to look at and play.
  - Key features block with the heading and listed features (possibly with short descriptions).
  - Use cases block with the heading and use cases (possibly with short descriptions).

### Examples page 

Contains:
  - Frameworks component for the user to select a framework.

Example sources and descriptions .md files are stored in "*/**/examples/[FRAMEWORK_NAME]/[EXAMPLE_NAME]" and are loaded in Livecodes code playground.

### API page 

Contains:
  - Frameworks component for the user to select a framework.

Framework specific API documentation .md files are stored in "*/**/API/[FRAMEWORK_NAME]" and are parsed at build time.

## Design notes

Use TS / React. Do not use Tailwind. Instead create a design system, css variables, primary, active and secondary colors, background colors, spacing, typography etc. Color palette dark. You can use components from UI kit libraries like Radix-UI, Mantine, MUI, Chakra etc.