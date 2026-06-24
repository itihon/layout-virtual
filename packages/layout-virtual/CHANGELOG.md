# layout-virtual

## 0.6.5

### Patch Changes

- aefdc2e: Fix layout shift bug in updating visible items on data change, fix incorrect visible items range calculation.

## 0.6.4

### Patch Changes

- c119db4: Fix bugs, add a dedicated event handler for updating visible items on data change (required for implementing infinite scroll).

## 0.6.3

### Patch Changes

- 45bffea: Fix repetetive event callback assigning.

## 0.6.2

### Patch Changes

- 7854634: Add disposing the engine resources on component unmount.

## 0.6.1

### Patch Changes

- 42dfabb: Fix initial render, add flushing after clearing items.

## 0.6.0

### Minor Changes

- 5dcd78d: Remove refs passing to components, remove commit phase, instead add tracking rendered items by data-index attribute in MutationObserver.

## 0.5.0

### Minor Changes

- 7744614: Remove getApi method, add event callbacks as props.

## 0.4.1

### Patch Changes

- ea3cd9f: Add limits to setting viewport position to prevent partial overlapping with content layer (gaps).

## 0.4.0

### Minor Changes

- 650e23d: Added getApi method for accessing imperative API.

## 0.3.3

### Patch Changes

- dead44d: Fix bugs

## 0.3.2

### Patch Changes

- 5e9b1f1: Improve rendering algorithm, fix bugs.

## 0.3.1

### Patch Changes

- de45700: Add render limits by min and max visible index, improve scroll anchor item position calculations.

## 0.3.0

### Minor Changes

- 440f6d3: Add multicolumn responsive grid layout support.

## 0.2.0

### Minor Changes

- 58e80a7: Add internal containers styling support by exposing class name props

## 0.1.2

### Patch Changes

- 5f612e4: Checking TS batch publishing issue.

## 0.1.1

### Patch Changes

- 73933ef: Optimize bundle size, separate library core entry point from the vanilla component.

## 0.1.0

### Minor Changes

- 0c744fb: Replaced ArrayItemStore with a simple array for keeping list item data. Deduplicated code in framework renderers.
