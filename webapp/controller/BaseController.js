sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
  "use strict";

  return Controller.extend("project2.controller.BaseController", {
    getModel(sName) {
      return this.getView().getModel(sName);
    },

    getI18nText(sText, aArgs) {
      return this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle()
        .getText(sText, aArgs);
    },
  });
});
