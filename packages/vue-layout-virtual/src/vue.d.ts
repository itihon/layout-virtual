/**
 * @fileoverview Vue module type declaration.
 * @license MIT
 * @author Alexandr Kalabin
 */

declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent;
  export default component;
}
