# vue-layout-virtual

## 0.5.4

### Patch Changes

- c119db4: Fix bugs, add a dedicated event handler for updating visible items on data change (required for implementing infinite scroll).
- Updated dependencies [c119db4]
  - layout-virtual@0.6.4

## 0.5.3

### Patch Changes

- 45bffea: Fix repetetive event callback assigning.
- Updated dependencies [45bffea]
  - layout-virtual@0.6.3

## 0.5.2

### Patch Changes

- 7854634: Add disposing the engine resources on component unmount.
- Updated dependencies [7854634]
  - layout-virtual@0.6.2

## 0.5.1

### Patch Changes

- 42dfabb: Fix initial render, add flushing after clearing items.
- Updated dependencies [42dfabb]
  - layout-virtual@0.6.1

## 0.5.0

### Minor Changes

- 5dcd78d: Remove refs passing to components, remove commit phase, instead add tracking rendered items by data-index attribute in MutationObserver.

### Patch Changes

- Updated dependencies [5dcd78d]
  - layout-virtual@0.6.0

## 0.4.1

### Patch Changes

- e57f26e: Read event callbacks from props instead of attributes.

## 0.4.0

### Minor Changes

- 7744614: Remove getApi method, add event callbacks as props.

### Patch Changes

- Updated dependencies [7744614]
  - layout-virtual@0.5.0

## 0.3.2

### Patch Changes

- de65274: Add re-rendering on data change.

## 0.3.1

### Patch Changes

- ea3cd9f: Add limits to setting viewport position to prevent partial overlapping with content layer (gaps).
- Updated dependencies [ea3cd9f]
  - layout-virtual@0.4.1

## 0.3.0

### Minor Changes

- 650e23d: Added getApi method for accessing imperative API.

### Patch Changes

- Updated dependencies [650e23d]
  - layout-virtual@0.4.0

## 0.2.3

### Patch Changes

- dead44d: Fix bugs
- Updated dependencies [dead44d]
  - layout-virtual@0.3.3

## 0.2.2

### Patch Changes

- 5e9b1f1: Improve rendering algorithm, fix bugs.
- Updated dependencies [5e9b1f1]
  - layout-virtual@0.3.2

## 0.2.1

### Patch Changes

- de45700: Add render limits by min and max visible index, improve scroll anchor item position calculations.
- Updated dependencies [de45700]
  - layout-virtual@0.3.1

## 0.2.0

### Minor Changes

- 440f6d3: Add multicolumn responsive grid layout support.

### Patch Changes

- Updated dependencies [440f6d3]
  - layout-virtual@0.3.0

## 0.1.0

### Minor Changes

- 58e80a7: Add internal containers styling support by exposing class name props

### Patch Changes

- Updated dependencies [58e80a7]
  - layout-virtual@0.2.0

## 0.0.6

### Patch Changes

- 5f612e4: Checking TS batch publishing issue.
- Updated dependencies [5f612e4]
  - layout-virtual@0.1.2

## 0.0.5

### Patch Changes

- 73933ef: Optimize bundle size, separate library core entry point from the vanilla component.
- Updated dependencies [73933ef]
  - layout-virtual@0.1.1

## 0.0.4

### Patch Changes

- 0c744fb: Replaced ArrayItemStore with a simple array for keeping list item data. Deduplicated code in framework renderers.
- Updated dependencies [0c744fb]
  - layout-virtual@0.1.0
