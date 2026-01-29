sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
  "use strict";

  return Controller.extend("project2.controller.BaseController", {
    getBookModel() {
      return this.getView().getModel("books");
    },

    getI18nText(sText) {
      return this.getView().getModel("i18n").getResourceBundle().getText(sText);
    },
  });
});
